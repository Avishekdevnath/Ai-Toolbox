import { NextRequest, NextResponse } from 'next/server';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await params;
    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();
    let form = await Form.findOne({ slug: id });
    if (!form && mongoose.Types.ObjectId.isValid(id)) {
      form = await Form.findById(new mongoose.Types.ObjectId(id));
    }
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (form.status !== 'published') return NextResponse.json({ success: false, error: 'Form not available' }, { status: 403 });

    const now = new Date();
    if (form.settings?.startAt && new Date(form.settings.startAt) > now) {
      return NextResponse.json({ success: false, error: 'Form not yet available' }, { status: 403 });
    }
    if (form.settings?.endAt && new Date(form.settings.endAt) < now) {
      return NextResponse.json({ success: false, error: 'Form expired' }, { status: 403 });
    }

    const responder = {
      name: body?.responder?.name,
      email: body?.responder?.email?.toLowerCase(),
      studentId: body?.responder?.studentId,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || '',
    };

    // Dedupe/one-attempt policies
    if (form.submissionPolicy?.oneAttemptPerIdentity) {
      if (form.submissionPolicy?.dedupeBy?.includes('email') && responder.email) {
        const exists = await FormResponse.findOne({ formId: form._id, 'responder.email': responder.email });
        if (exists) return NextResponse.json({ success: false, error: 'You have already submitted' }, { status: 409 });
      }
      if (form.submissionPolicy?.dedupeBy?.includes('studentId') && responder.studentId) {
        const exists = await FormResponse.findOne({ formId: form._id, 'responder.studentId': responder.studentId });
        if (exists) return NextResponse.json({ success: false, error: 'You have already submitted' }, { status: 409 });
      }
    }

    // Timer enforcement for quizzes
    if (form.type === 'quiz' && form.settings?.timer?.enabled) {
      const allowedMs = (form.settings.timer.minutes || 0) * 60 * 1000;
      const durationMs = typeof body.durationMs === 'number' ? body.durationMs : 0;
      // Allow 10 seconds buffer for auto-submit scenarios and network delays
      const bufferMs = 10000;
      if (durationMs > allowedMs + bufferMs) {
        console.log('⏰ Timer enforcement: Duration exceeded', { 
          durationMs, 
          allowedMs, 
          bufferMs, 
          exceeded: durationMs - allowedMs 
        });
        return NextResponse.json({ success: false, error: 'Submission exceeded time limit' }, { status: 400 });
      }
    }

    // Basic validation: required fields
    const requiredFieldIds = (form.fields || []).filter((f: any) => f.required && f.visibility !== 'internal').map((f: any) => f.id);
    const provided = new Set((body?.answers || []).map((a: any) => a.fieldId));
    for (const fid of requiredFieldIds) {
      if (!provided.has(fid)) {
        return NextResponse.json({ success: false, error: `Missing required field: ${fid}` }, { status: 400 });
      }
    }

    // Optional scoring for quizzes
    let score: number | undefined = undefined;
    let maxScore: number | undefined = undefined;
    if (form.type === 'quiz') {
      const fieldIdToField: Record<string, any> = {};
      for (const f of form.fields || []) fieldIdToField[f.id] = f;
      const answers = body.answers || [];
      score = 0;
      maxScore = 0;
      for (const f of form.fields || []) {
        const points = f?.quiz?.points || 0;
        maxScore += points;
        const correct = Array.isArray(f?.quiz?.correctOptions) ? f.quiz.correctOptions : [];
        if (!points || correct.length === 0) continue;
        const a = answers.find((x: any) => x.fieldId === f.id);
        if (!a) continue;
        if (f.type === 'checkbox') {
          const given = new Set(Array.isArray(a.value) ? a.value : []);
          const labels = (f.options || []).map((o: any, idx: number) => ({ idx, o }));
          const correctLabels = new Set(labels.filter(x => correct.includes(x.idx)).map(x => x.o));
          const givenClean = new Set((Array.isArray(a.value) ? a.value : []).map((v: any) => String(v)));
          const match = Array.from(correctLabels).every(l => givenClean.has(String(l))) &&
                       Array.from(givenClean).every(l => correctLabels.has(String(l)));
          if (match) score += points;
        } else {
          const idx = (f.options || []).findIndex((o: any) => o === a.value);
          if (idx >= 0 && correct.includes(idx)) score += points;
        }
      }
    }

    const doc = await FormResponse.create({
      formId: form._id,
      responder,
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
      submittedAt: new Date(),
      durationMs: body.durationMs,
      answers: body.answers || [],
      score,
      maxScore,
    });

    return NextResponse.json({ success: true, data: { id: String(doc._id), score, maxScore } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to submit form' }, { status: 500 });
  }
}


