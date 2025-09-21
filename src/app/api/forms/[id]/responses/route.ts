import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import { toResponseData } from '@/lib/forms-utils';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';

function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    const exportFormat = searchParams.get('export') || 'json';
    const exportCsv = exportFormat === 'csv';
    const exportExcel = exportFormat === 'excel';
    const exportPdf = exportFormat === 'pdf';
    const exportGoogleDocs = exportFormat === 'google-docs';
    const { id } = await params;

    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();
    const form = await Form.findById(new mongoose.Types.ObjectId(id)).lean();
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (String(form.ownerId) !== String(claims.id)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const [items, total] = await Promise.all([
      FormResponse.find({ formId: form._id }).sort({ submittedAt: -1 }).skip(offset).limit(limit).lean(),
      FormResponse.countDocuments({ formId: form._id }),
    ]);

    if (exportCsv) {
      // Only include system fields if they have actual data
      const hasName = items.some(r => r.responder?.name);
      const hasEmail = items.some(r => r.responder?.email);
      const hasStudentId = items.some(r => r.responder?.studentId);
      
      const systemHeaders = [];
      if (hasName) systemHeaders.push('name');
      if (hasEmail) systemHeaders.push('email');
      if (hasStudentId) systemHeaders.push('studentId');
      
      const headers = ['submittedAt', ...systemHeaders, ...form.fields.map((f: any) => f.label || f.id)];
      const rows: string[][] = [headers];
      
      for (const r of items) {
        const base = [new Date(r.submittedAt).toISOString()];
        
        // Add system fields only if they exist
        if (hasName) base.push(r.responder?.name || '');
        if (hasEmail) base.push(r.responder?.email || '');
        if (hasStudentId) base.push(r.responder?.studentId || '');
        
        const ansMap: Record<string, any> = {};
        for (const a of (r.answers || [])) ansMap[a.fieldId] = a.value;
        const rest = form.fields.map((f: any) => ansMap[f.id] !== undefined ? (typeof ansMap[f.id] === 'object' ? JSON.stringify(ansMap[f.id]) : String(ansMap[f.id])) : '');
        rows.push([...base, ...rest]);
      }
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${form.title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_')}_responses.csv"`
        }
      });
    }

    if (exportExcel) {
      // Only include system fields if they have actual data
      const hasName = items.some(r => r.responder?.name);
      const hasEmail = items.some(r => r.responder?.email);
      const hasStudentId = items.some(r => r.responder?.studentId);
      
      const systemHeaders = [];
      if (hasName) systemHeaders.push('name');
      if (hasEmail) systemHeaders.push('email');
      if (hasStudentId) systemHeaders.push('studentId');
      
      const headers = ['submittedAt', ...systemHeaders, ...form.fields.map((f: any) => f.label || f.id)];
      const rows: any[][] = [headers];
      
      for (const r of items) {
        const base = [new Date(r.submittedAt).toISOString()];
        
        // Add system fields only if they exist
        if (hasName) base.push(r.responder?.name || '');
        if (hasEmail) base.push(r.responder?.email || '');
        if (hasStudentId) base.push(r.responder?.studentId || '');
        
        const ansMap: Record<string, any> = {};
        for (const a of (r.answers || [])) ansMap[a.fieldId] = a.value;
        const rest = form.fields.map((f: any) => ansMap[f.id] !== undefined ? (typeof ansMap[f.id] === 'object' ? JSON.stringify(ansMap[f.id]) : String(ansMap[f.id])) : '');
        rows.push([...base, ...rest]);
      }
      
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Responses');
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${form.title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_')}_responses.xlsx"`
        }
      });
    }

    if (exportPdf) {
      // For PDF, we'll return a JSON response with the data for client-side PDF generation
      // This is more efficient than server-side PDF generation
      const transformedItems = items.map((r) => toResponseData(r, form));
      return NextResponse.json({ 
        success: true, 
        data: { 
          items: transformedItems, 
          total, 
          form: {
            title: form.title,
            description: form.description,
            fields: form.fields
          },
          exportFormat: 'pdf'
        } 
      });
    }

    if (exportGoogleDocs) {
      // For Google Docs, we'll return a JSON response with the data for client-side integration
      const transformedItems = items.map((r) => toResponseData(r, form));
      return NextResponse.json({ 
        success: true, 
        data: { 
          items: transformedItems, 
          total, 
          form: {
            title: form.title,
            description: form.description,
            fields: form.fields
          },
          exportFormat: 'google-docs'
        } 
      });
    }

    // Transform the response data to match UI expectations using shared helper
    const transformedItems = items.map((r) => toResponseData(r, form));

    return NextResponse.json({ success: true, data: { items: transformedItems, total, limit, offset } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to fetch responses' }, { status: 500 });
  }
}


