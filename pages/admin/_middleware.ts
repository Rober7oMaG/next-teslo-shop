import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
// import {jwt} from "../../utils";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const {origin} = req.nextUrl;

    if (!session) {
        const requestedPage = req.page.name;
        return NextResponse.redirect(`${origin}/auth/login?p=${requestedPage}`);
    }

    const validRoles = ['admin', 'super-user', 'SEO'];

    if (!validRoles.includes(session.user.role)) {
        return NextResponse.redirect(origin);
    }

    return NextResponse.next();
}