-- This new function handles the fallback scenario when geolocation is not available.
-- It sorts groups by the next upcoming meeting day.
CREATE OR REPLACE FUNCTION get_groups_sorted_by_day()
RETURNS TABLE (
  id UUID,
  name TEXT,
  format TEXT,
  specialisation TEXT,
  meeting_day TEXT,
  meeting_time TIME
) AS $$
DECLARE
    -- Get the current day of the week as a number (ISO standard: 1=Monday...7=Sunday)
    today_iso INT := EXTRACT(ISOWEEKDAY FROM NOW());
BEGIN
    RETURN QUERY
    WITH day_map AS (
      SELECT 
        v.day_name, 
        v.day_num 
      FROM (VALUES 
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
    FROM
      public.groups g
    JOIN day_map dm ON g.meeting_day = dm.day_name
    ORDER BY
      -- This complex ORDER BY calculates the "days until next meeting"
      -- and sorts by that, then by time.
      (dm.day_num - today_iso + 7) % 7,
      g.meeting_time;
END;
$$ LANGUAGE plpgsql;

