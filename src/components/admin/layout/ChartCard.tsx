"use client";
export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <h2 className="font-semibold text-[#0d47a1] mb-3 text-lg">{title}</h2>
      <div className="w-full h-[250px]">{children}</div>
    </div>
  );
}
