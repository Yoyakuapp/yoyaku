import { withAuth } from "next-auth/middleware";

import { authSecret } from "@/lib/authSecret";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: authSecret,
});

export const config = {
  matcher: ["/admin/:path*"],
};
