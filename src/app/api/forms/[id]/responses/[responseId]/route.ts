import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormResponseModel } from '@/models/FormResponseModel';
import { getFormModel } from '@/models/FormModel';
import mongoose from 'mongoose';
import { connectWithRetry } from '@/lib/mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectWithRetry();

    const { id: formId, responseId } = await params;

    // Validate form ID
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json({ success: false, error: 'Invalid form ID' }, { status: 400 });
    }

    // Validate response ID
    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return NextResponse.json({ success: false, error: 'Invalid response ID' }, { status: 400 });
    }

    // Verify form ownership
    const Form = await getFormModel();
    const form = await Form.findOne({ _id: formId, ownerId: claims.id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found or access denied' }, { status: 404 });
    }

    // Delete the response
    const FormResponse = await getFormResponseModel();
    const result = await FormResponse.deleteOne({ 
      _id: responseId, 
      formId: new mongoose.Types.ObjectId(formId) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Response deleted successfully' 
    });

  } catch (error: any) {
    console.error('API Error deleting response:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete response' },
      { status: 500 }
    );
  }
}
