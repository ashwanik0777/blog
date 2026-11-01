import { deleteStaff, updateStaff } from '@/lib/staffInput';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteContext) {
  const { id } = await params;
  return updateStaff(req, id);
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;
  return deleteStaff(req, id);
}
