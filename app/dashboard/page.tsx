import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value || "User";

    return (
        <main>
            <h1>Welcome, {username}</h1>
            <p>whatever a dashboard normally has like yeah that goes here</p>

            <section aria-labelledby="overview-heading" style={{ marginTop: 20 }}>
                <h2 id="overview-heading">another header</h2>
                <p>more text here</p>
            </section>

            <section aria-labelledby="notes-heading" style={{ marginTop: 16 }}>
                <h2 id="notes-heading">some header</h2>
                <p>even more text here</p>
            </section>
        </main>
    );
}