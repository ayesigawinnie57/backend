const features = [
  {
    emoji: '🚚',
    title: 'Fast Delivery',
    desc: 'Get your orders delivered to your door in 24–48 hours.',
  },
  {
    emoji: '🔒',
    title: 'Secure Payments',
    desc: 'Your payment info is always encrypted and protected.',
  },
  {
    emoji: '🔄',
    title: 'Easy Returns',
    desc: '30-day hassle-free return policy on all products.',
  },
  {
    emoji: '🎧',
    title: '24/7 Support',
    desc: 'Our support team is always here to help you anytime.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-2">Why Shop With Us?</h2>
          <p className="text-gray-500 text-sm">We make online shopping simple, safe, and enjoyable.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-4">
                {f.emoji}
              </div>
              <h3 className="font-bold text-navy mb-2 text-sm md:text-base">{f.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
