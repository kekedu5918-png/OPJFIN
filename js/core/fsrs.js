const FSRS = {
  newCard: () => ({
    interval: 0,
    ef: 2.5,
    due: Date.now(),
    reps: 0,
    ok: 0,
    ko: 0
  }),
  review(card, correct) {
    const c = { ...(card || FSRS.newCard()) };
    if (correct) {
      c.ok++;
      if (c.reps === 0) c.interval = 1;
      else if (c.reps === 1) c.interval = 6;
      else c.interval = Math.max(1, Math.round(c.interval * c.ef));
      c.ef = Math.min(2.5, Math.max(1.3, c.ef + 0.1));
    } else {
      c.ko++;
      c.interval = 1;
      c.ef = Math.max(1.3, c.ef - 0.2);
    }
    c.reps++;
    if (window.S?.user?.examDate) {
      const exam = new Date(window.S.user.examDate + '-01');
      const daysLeft = Math.max(1, Math.ceil((exam - Date.now()) / 86400000));
      c.interval = Math.min(c.interval, Math.max(1, Math.floor(daysLeft / 2)));
    }
    c.due = Date.now() + c.interval * 86400000;
    return c;
  },
  isDue: card => !card || card.due <= Date.now(),
  getDue(cat) {
    return (window.QB || [])
      .filter(q => !cat || q.cat === cat)
      .filter(q => FSRS.isDue(window.S?.qcm?.cards?.[q.id]));
  }
};

window.FSRS = FSRS;

