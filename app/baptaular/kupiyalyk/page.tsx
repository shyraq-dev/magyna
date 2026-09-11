export const metadata = { title: "Құпиялық саясаты — Мағына" };

export default function KupiyalykPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">Құпиялық саясаты</h1>
      <p className="mt-2 text-sm text-muted">
        Бұл бөлім қолданушының жеке мәліметтерінің қалай жиналатынын,
        сақталатынын және қорғалатынын ашық түрде реттейді.
      </p>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-xl">1.1. Жиналатын мәліметтер</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-muted">
          <li>
            <strong className="text-ink">Идентификациялық деректер:</strong>{" "}
            тіркелу түріне байланысты пайдаланушының есімі, электрондық
            поштасы немесе Telegram Mini App арқылы кіргендегі initData
            (Telegram ID, username, аты-жөні).
          </li>
          <li>
            <strong className="text-ink">Белсенділік деректері:</strong>{" "}
            оқырманның жеке сөресіне сақтаған кітаптары, оқу прогресі,
            жаңалықтарға басылған реакциялары мен қалдырған пікірлері.
          </li>
          <li>
            <strong className="text-ink">Техникалық деректер:</strong>{" "}
            құрылғы түрі (iOS, Android, Web), экран рұқсаты, қолданба
            нұсқасы және жүйелік қателер логы (Crash logs).
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl">
          1.2. Деректерді пайдалану мақсаты
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-muted">
          <li>
            Пайдаланушының тіркелгісін сәйкестендіру (аутентификация) және
            жеке сөресін әртүрлі құрылғыларда (телефон, ноутбук) синхронды
            түрде көрсету.
          </li>
          <li>
            Жаңа туындылар, дорама талқылаулары мен жаңалықтар туралы
            хабарламалар (push-notifications) жолдау.
          </li>
          <li>Қолданбаның тұрақтылығы мен латенттілігін жақсарту.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl">
          1.3. Деректерді қорғау және үшінші тарапқа бермеу
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-muted">
          <li>
            Пайдаланушылардың жеке деректері ешқашан коммерциялық мақсатта
            үшінші тараптарға сатылмайды немесе берілмейді.
          </li>
          <li>
            Барлық құпия мәліметтер (парольдер, токендер) заманауи шифрлау
            (SSL/TLS) хаттамалары арқылы қорғалады.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl">1.4. Деректерді өшіру құқығы</h2>
        <p className="mt-4 text-muted">
          Пайдаланушы кез келген уақытта «Баптаулар» (Settings) бөлімі
          арқылы өз тіркелгісін және оған байланысты барлық жеке
          мәліметтерін жүйеден толықтай өшіруді талап ете алады.
        </p>
      </section>
    </div>
  );
}
