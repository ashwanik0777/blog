import { toggleStaffStatus } from '@/lib/staffInput';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return toggleStaffStatus(req, id);
}
