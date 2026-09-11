export default function Aurora() {
  return (
    <div className="fixed inset-0 -z-0 overflow-hidden pointer-events-none">
      <div
        className="aurora-blob w-[40rem] h-[40rem] -top-40 -right-40 bg-growth animate-aurora-drift"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="aurora-blob w-[34rem] h-[34rem] top-1/3 -left-40 bg-couple animate-aurora-drift"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="aurora-blob w-[30rem] h-[30rem] -bottom-32 right-1/4 bg-sun animate-aurora-drift"
        style={{ animationDelay: '-12s' }}
      />
    </div>
  )
}
