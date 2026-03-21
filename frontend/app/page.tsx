import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

function hasSessionCookie(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name)

  return cookieNames.some(
    (name) =>
      name === "better-auth.session_token" ||
      name === "__Secure-better-auth.session_token" ||
      name === "better-auth-session_token" ||
      name === "__Secure-better-auth-session_token"
  )
}

export default async function Home() {
  const cookieStore = await cookies()

  if (hasSessionCookie(cookieStore)) {
    redirect("/dashboard")
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <p className="text-sm font-semibold text-white">MedDiagnose</p>
          <div className="flex items-center">
            <Link href="/login" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/signup" className="ml-4 rounded-md bg-white px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-zinc-100">
              Get started →
            </Link>
          </div>
        </div>
      </header>

      <section className="flex min-h-screen flex-col items-center justify-center bg-black px-6 pt-20 pb-32 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>Soft Computing · Fuzzy-Bayesian Pipeline</span>
          </div>
          <h1 className="mx-auto mb-6 max-w-3xl text-5xl leading-[1.1] font-bold tracking-tight text-white md:text-6xl">
            Symptom-Driven
            <br />
            Medical Diagnosis
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-zinc-400">
            Enter your symptoms. The system applies Fuzzy Set Theory and Bayesian Inference across 4,920 clinical records to rank 41 disease categories by posterior probability.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="rounded-md bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-100">
              Start diagnosis
            </Link>
            <Link href="/login" className="rounded-md border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Educational use only · Not a substitute for medical advice</p>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-black py-12">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          {[
            { value: "131", label: "symptoms" },
            { value: "41", label: "diseases" },
            { value: "4,920", label: "records" },
            { value: "5-step", label: "pipeline" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold tabular-nums text-white">{stat.value}</p>
              <p className="mt-1.5 text-xs uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-950 py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="mb-4 text-xs font-medium tracking-widest text-zinc-500 uppercase">THE PIPELINE</p>
          <h2 className="mb-16 text-3xl font-bold tracking-tight text-white">How the system works</h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Fuzzification",
                body: "Severity weights 1–7 map to LOW, MEDIUM, and HIGH memberships via Triangular MFs. Partition of Unity guarantees all degrees sum to 1.0.",
              },
              {
                step: "02",
                title: "Evidence Scoring",
                body: "Laplace-smoothed P(S|D) from 3,936 training records. evidence(S,D) = severity_score × P(S|D) — the formula that couples fuzzy and Bayesian systems.",
              },
              {
                step: "03",
                title: "Bayesian Posterior",
                body: "Log-sum ranks all 41 diseases by posterior probability. Max-subtraction prevents underflow. Output: calibrated probability distribution across all diseases.",
              },
            ].map((item) => (
              <article key={item.step} className="bg-zinc-950 p-8 transition-colors hover:bg-zinc-900">
                <p className="mb-4 font-mono text-xs text-zinc-600">{item.step}</p>
                <h3 className="mb-3 text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-black py-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm font-semibold text-white">MedDiagnose</p>
              <p className="mt-1 text-xs text-zinc-600">Soft Computing Research Project</p>
            </div>
            <div className="flex gap-6">
              <Link href="/login" className="text-sm text-zinc-500 transition-colors hover:text-white">Sign in</Link>
              <Link href="/signup" className="text-sm text-zinc-500 transition-colors hover:text-white">Get started</Link>
            </div>
          </div>
          <p className="mt-8 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-700">
            © 2024 MedDiagnose · Educational use only
          </p>
        </div>
      </footer>
    </div>
  )
}
