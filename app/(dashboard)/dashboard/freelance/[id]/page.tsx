import FreelanceDetail from "@/components/dashboard/freelance/FreelanceDetail";

export default async function FreelanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FreelanceDetail id={id} />;
}
