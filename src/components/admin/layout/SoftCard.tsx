export default function SoftCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-all transform hover:scale-[1.02] border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
