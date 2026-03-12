export function Footer() {
  return (
    <footer className="bg-surface border-t border-border" style={{ padding: '60px 5% 0' }}>
      {/* Main grid */}
      <div
        className="grid gap-10 pb-12"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        {/* Col 1 — Brand */}
        <div className="flex flex-col gap-4">
          <span className="font-heading font-bold text-text-primary text-lg">
            DIMENSION.LAB3D
          </span>
          <p className="text-text-secondary text-sm leading-relaxed max-w-[260px]">
            Transformando ideias em objetos reais com tecnologia de impressão 3D de alta
            qualidade.
          </p>
          <div className="flex gap-2 mt-1">
            {[
              { label: 'Instagram', icon: '📸' },
              { label: 'YouTube', icon: '▶️' },
              { label: 'WhatsApp', icon: '💬' },
            ].map(({ label, icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:bg-accent-blue hover:border-accent-blue hover:text-white text-base"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Navegação */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-widest mb-1">
            Navegação
          </h3>
          {[
            { label: 'Como Funciona', href: '/' },
            { label: 'Portfólio', href: '/portfolio' },
            { label: 'Galeria', href: '/portfolio' },
            { label: 'Orçamento', href: '/quote' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-text-secondary hover:text-accent-blue text-sm transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Col 3 — Materiais */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-widest mb-1">
            Materiais
          </h3>
          {['PLA', 'PETG', 'ABS', 'Resina', 'TPU'].map((m) => (
            <span key={m} className="text-text-secondary text-sm">
              {m}
            </span>
          ))}
        </div>

        {/* Col 4 — Contato */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-widest mb-1">
            Contato
          </h3>
          {[
            { label: 'WhatsApp' },
            { label: 'Instagram' },
            { label: 'YouTube' },
            { label: 'E-mail' },
          ].map(({ label }) => (
            <a
              key={label}
              href="#"
              className="text-text-secondary hover:text-accent-blue text-sm transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Footer bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border py-5 text-xs text-text-secondary">
        <span>© 2026 Dimension.Lab3D. Todos os direitos reservados.</span>
        <span>Feito com ❤️ e filamento PLA</span>
      </div>
    </footer>
  )
}