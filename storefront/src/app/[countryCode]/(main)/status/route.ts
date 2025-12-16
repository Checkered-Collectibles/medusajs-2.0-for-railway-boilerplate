import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const GET = (req: NextRequest) => {
    redirect("https://status.checkered.in/status/server")
};