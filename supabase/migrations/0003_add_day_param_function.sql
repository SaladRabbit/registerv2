-- Create a parameterized version of the day-sorted groups RPC
-- Matches edge function call: get_groups_sorted_by_day(today_iso_day int)

CREATE OR REPLACE FUNCTION public.get_groups_sorted_by_day(today_iso_day int)
RETURNS TABLE (
  id uuid,
  name text,
  format text,
  specialisation text,
  meeting_day text,
  meeting_time time
) AS $$
  WITH day_map AS (
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
    ((dm.day_num - today_iso_day + 7) % 7),
    g.meeting_time;
$$ LANGUAGE sql STABLE;

-- Ensure anon/authenticated can execute via PostgREST
GRANT EXECUTE ON FUNCTION public.get_groups_sorted_by_day(integer) TO anon, authenticated, service_role;


