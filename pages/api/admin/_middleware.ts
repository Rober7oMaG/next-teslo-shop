import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
// import {jwt} from "../../utils";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const {origin} = req.nextUrl;

    if (!session) {
        return new Response(JSON.stringify({message: "Unauthorized"}), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const validRoles = ['admin', 'super-user', 'SEO'];

    if (!validRoles.includes(session.user.role)) {
        return new Response(JSON.stringify({message: "Unauthorized"}), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return NextResponse.next();
}