import Link from 'next/link'

export function NavTabs({ tabs }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 text-gray-700"
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}


