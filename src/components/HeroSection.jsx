export function HeroSection() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="text-center space-y-6 max-w-2xl relative z-10">
        {/* Анимированное название сайта */}
        <div className="relative">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight">
            <span className="inline-block bg-gradient-to-r from-primary via-purple-500 via-pink-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              doposter
            </span>
          </h1>
          {/* Тень для эффекта свечения */}
          <h1 
            className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight absolute inset-0 blur-sm opacity-50"
            aria-hidden="true"
          >
            <span className="inline-block bg-gradient-to-r from-primary via-purple-500 via-pink-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              doposter
            </span>
          </h1>
        </div>
        
        {/* Подзаголовок с анимацией */}
        <p className="text-lg sm:text-xl text-muted-foreground animate-fade-in-up max-w-xl mx-auto leading-relaxed">
          Создавайте уникальные постеры с помощью искусственного интеллекта
        </p>
        
        {/* Декоративные элементы */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

