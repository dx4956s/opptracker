import ContractDetail from "@/components/dashboard/contracts/ContractDetail";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractDetail id={id} />;
}
