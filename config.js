/* ============================================================
   PIPS OUT! — instellingen
   Het enige bestand dat je moet aanraken om de erelijst van
   dit-toestel-alleen naar heel-de-club om te schakelen.
   ============================================================ */
window.PIPSOUT = {

  leaderboard: {

    /* 'local'    = ieder zijn eigen lijst, op zijn eigen toestel.
       'supabase' = één gedeelde ranglijst voor heel de club.

       Zolang url en key leeg zijn, valt het spel gewoon terug op
       'local'. Invullen en pushen volstaat om over te schakelen —
       de SQL voor de tabel staat in README.md.                     */
    provider: 'supabase',

    url: 'https://aqaikstibteqcdgxtuiw.supabase.co',      // Project URL, bv. 'https://abcdefghijkl.supabase.co'
    key: 'sb_publishable_yt1HRtTr-Z8WCiZv3_uCkQ_on2j5ZJ4',      // de anon public key (die hoort publiek te zijn)
    table: 'scores',

    limit: 25     // hoeveel spelers in de lijst
  }
};
