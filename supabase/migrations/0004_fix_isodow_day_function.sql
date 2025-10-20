-- Fix: use valid Postgres unit ISODOW (not ISOWEEKDAY) for current weekday
-- Updates the existing no-arg function to sort by next meeting day

CREATE OR REPLACE FUNCTION public.get_groups_sorted_by_day()
RETURNS TABLE (
  id uuid,
  name text,
  format text,
  specialisation text,
  meeting_day text,
  meeting_time time
) AS $$
  WITH params AS (
    SELECT EXTRACT(ISODOW FROM CURRENT_DATE)::int AS today_iso_day
  ),
  day_map AS (
    SELECT * FROM (
      VALUES
        ('Monday', 1),
        ('Tuesday', 2),
        ('Wednesday', 3),
        ('Thursday', 4),
        ('Friday', 5),
        ('Saturday', 6),
        ('Sunday', 7)
    ) AS v(day_name, day_num)
  )
  SELECT
    g.id,
    g.name,
    g.format,
    g.specialisation,
    g.meeting_day,
    g.meeting_time
  FROM public.groups g
  JOIN day_map dm ON g.meeting_day = dm.day_name
  ORDER BY
    ((dm.day_num - (SELECT today_iso_day FROM params) + 7) % 7),
    g.meeting_time;
$$ LANGUAGE sql STABLE;

GRANT EXECUTE ON FUNCTION public.get_groups_sorted_by_day() TO anon, authenticated, service_role;


