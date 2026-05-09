import { JobForm } from "@/components/jobs/job-form";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add a job</h1>
        <p className="text-muted-foreground">
          Paste the description and we&apos;ll be ready to tailor your resume in seconds.
        </p>
      </div>
      <JobForm />
    </div>
  );
}
