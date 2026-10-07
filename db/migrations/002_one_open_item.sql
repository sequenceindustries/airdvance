-- Enforce one open application and one open loan per customer at the database level.
create unique index if not exists applications_one_open_per_user
  on applications (user_id) where status in ('SUBMITTED', 'MORE_INFO_REQUIRED');
create unique index if not exists loans_one_open_per_user
  on loans (user_id) where status in ('OFFERED', 'ACCEPTED', 'ACTIVE', 'ARREARS');
