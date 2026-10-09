/* Shared Supabase REST client for the static Vercel app. */
(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const url = String(cfg.url || '').replace(/\/$/, '');
  const anonKey = String(cfg.anonKey || '');
  const configured = Boolean(url && anonKey && !url.includes('YOUR_') && !anonKey.includes('YOUR_'));
  const localKey = 'chamdiem_submissions';

  function headers(extra) {
    return Object.assign({
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    }, extra || {});
  }

  function fromRow(row) {
    return {
      id: row.id,
      union: 'Công đoàn Công ty Cổ phần Bột giặt NET',
      contest: 'Hội thi Nấu Ăn: Mâm Cơm Sum Vầy Cuối Tuần',
      date: row.contest_date,
      judgeId: row.judge_id,
      judge: row.judge_name,
      teamId: row.team_id,
      team: row.team_name,
      scores: [
        { name: 'Hương vị món ăn', max: 40, value: row.score_flavor },
        { name: 'Sự hợp lý & Cân đối dinh dưỡng', max: 20, value: row.score_nutrition },
        { name: 'Trình bày & Thẩm mỹ', max: 20, value: row.score_presentation },
        { name: 'Thuyết trình', max: 10, value: row.score_presentation_talk },
        { name: 'An toàn vệ sinh & Dọn dẹp', max: 10, value: row.score_hygiene }
      ],
      total: Number(row.total_score || 0),
      comment: row.comment || '',
      submittedAt: row.created_at
    };
  }

  async function list() {
    if (!configured) {
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    }
    const response = await fetch(
      `${url}/rest/v1/cham_diem_submissions?select=*&order=created_at.desc`,
      { headers: headers() }
    );
    if (!response.ok) throw new Error(`Không tải được dữ liệu (${response.status})`);
    return (await response.json()).map(fromRow);
  }

  async function listByJudge(judgeId, judgeName, contestDate) {
    if (!configured) {
      return (JSON.parse(localStorage.getItem(localKey) || '[]'))
        .filter(item =>
          (item.judgeId === judgeId || item.judge_id === judgeId || item.judge === judgeName)
          && (!contestDate || item.date === contestDate)
        );
    }
    const dateQuery = contestDate ? `&contest_date=eq.${encodeURIComponent(contestDate)}` : '';
    const response = await fetch(
      `${url}/rest/v1/cham_diem_submissions?select=*&judge_id=eq.${encodeURIComponent(judgeId)}${dateQuery}&order=created_at.desc`,
      { headers: headers() }
    );
    if (!response.ok) {
      const message = await response.text();
      // Compatibility with the old table before judge_id migration is run.
      if (response.status === 400 && /judge_id|schema cache|PGRST204/i.test(message)) {
        const all = await list();
        return all.filter(item =>
          (item.judgeId === judgeId || item.judge === judgeName)
          && (!contestDate || item.date === contestDate)
        );
      }
      throw new Error(`Không kiểm tra được đội đã chấm (${response.status})`);
    }
    return (await response.json()).map(fromRow);
  }

  async function insert(payload) {
    if (!configured) {
      const rows = JSON.parse(localStorage.getItem(localKey) || '[]');
      rows.push(payload);
      localStorage.setItem(localKey, JSON.stringify(rows));
      return payload;
    }
    const values = payload.scores.map(s => Number(s.value));
    const body = {
      contest_date: payload.date,
      judge_id: payload.judgeId,
      judge_name: payload.judge,
      team_id: payload.teamId,
      team_name: payload.team,
      score_flavor: values[0],
      score_nutrition: values[1],
      score_presentation: values[2],
      score_presentation_talk: values[3],
      score_hygiene: values[4],
      comment: payload.comment || ''
    };
    const response = await fetch(`${url}/rest/v1/cham_diem_submissions`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const message = await response.text();
      // Allow the app to keep working while an existing project is being migrated.
      if (response.status === 400 && /judge_id|schema cache|PGRST204/i.test(message)) {
        const legacyBody = Object.assign({}, body);
        delete legacyBody.judge_id;
        const legacyResponse = await fetch(`${url}/rest/v1/cham_diem_submissions`, {
          method: 'POST',
          headers: headers({ Prefer: 'return=representation' }),
          body: JSON.stringify(legacyBody)
        });
        if (!legacyResponse.ok) {
          const legacyMessage = await legacyResponse.text();
          throw new Error(legacyMessage || `Không lưu được dữ liệu (${legacyResponse.status})`);
        }
        const legacyRows = await legacyResponse.json();
        return legacyRows[0] ? fromRow(legacyRows[0]) : payload;
      }
      throw new Error(message || `Không lưu được dữ liệu (${response.status})`);
    }
    const rows = await response.json();
    return rows[0] ? fromRow(rows[0]) : payload;
  }

  async function remove(id) {
    if (configured) throw new Error('Xóa dữ liệu online cần thực hiện trong Supabase Dashboard.');
    const rows = JSON.parse(localStorage.getItem(localKey) || '[]');
    rows.splice(Number(id), 1);
    localStorage.setItem(localKey, JSON.stringify(rows));
  }

  window.NETCO_DB = { configured, list, listByJudge, insert, remove };
})();
