import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';

import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/dashboard/StatsCard';
import UserOverviewChart from '../../components/dashboard/UserOverviewChart';
import RoleDistributionChart from '../../components/dashboard/RoleDistributionChart';
import RecentActivityPanel from '../../components/dashboard/RecentActivityPanel';

import { userApi } from '../../api/userApi';
import { roleApi } from '../../api/roleApi';

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRolesMap, setUserRolesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, rRes] = await Promise.allSettled([
          userApi.getAllUsers(),
          roleApi.getAllRoles(),
        ]);

        const u =
          uRes.status === 'fulfilled'
            ? uRes.value.data?.content || uRes.value.data || []
            : [];

        const r =
          rRes.status === 'fulfilled'
            ? rRes.value.data || []
            : [];

        const usersList = Array.isArray(u) ? u : [];

        setUsers(usersList);
        setRoles(Array.isArray(r) ? r : []);

        // Fetch roles for each user
        const results = await Promise.all(
          usersList.map(async (user) => {
            try {
              const res = await roleApi.getRolesForUser(user.id);
              return { userId: user.id, roles: res.data || [] };
            } catch {
              return { userId: user.id, roles: [] };
            }
          })
        );

        const map = {};
        results.forEach((r) => {
          map[r.userId] = r.roles;
        });

        setUserRolesMap(map);
      } catch (error) {
        console.error('Dashboard load failed:', error);
        setUsers([]);
        setRoles([]);
        setUserRolesMap({});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ Safe role name extractor
  const getRoleName = (r) => r?.name || r?.roleName || r;

  // ✅ Excluded roles
  const EXCLUDED_ROLES = new Set([
    'APPROVAL_MANAGER_L1',
    'APPROVAL_MANAGER_L2',
    'RESOURCE_OWNER',
  ]);

  // ✅ Filtered role count
  const displayRoleCount = roles.filter(
    (r) => !EXCLUDED_ROLES.has(getRoleName(r))
  ).length;

  // ✅ Stats
  const total = users.length;
  const active = users.filter((u) => u.status === 'ACTIVE').length;
  const disabled = users.filter((u) => u.status === 'DISABLED').length;
  const pending = users.filter(
    (u) => u.status === 'PENDINGACTIVATION'
  ).length;

  // ✅ Cards data (fixed)
  const cards = [
    {
      label: 'Total Users',
      value: total,
      color: '#27235C',
      bg: '#EEF0FF',
      trend: 1,
      trendLabel: `${pending} pending activation`,
    },
    {
      label: 'Active Users',
      value: active,
      color: '#24A148',
      bg: '#ECFDF5',
      trend: 1,
      trendLabel: total
        ? `${Math.round((active / total) * 100)}% of total`
        : '',
    },
    {
      label: 'Disabled Users',
      value: disabled,
      color: '#E01950',
      bg: '#FFF1F3',
      trend: disabled > 0 ? -1 : 0,
      trendLabel: disabled ? `${disabled} disabled` : 'None disabled',
    },
    {
      label: 'Total Roles',
      value: displayRoleCount, // ✅ FIXED
      color: '#97247E',
      bg: '#FDF4FB',
      trend: 0,
      trendLabel: 'System roles',
    },
  ];

  // ✅ Loading state
  if (loading) {
    return <Box sx={{ p: 3 }}>Loading dashboard...</Box>;
  }

  return (
    <Box sx={{ bgcolor: '#F0F2F8', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of users, roles, and access activity"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* ✅ Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <StatsCard
              label={card.label}
              value={card.value}
              color={card.color}
              bg={card.bg}
              trend={card.trend}
              trendLabel={card.trendLabel}
            />
          </Grid>
        ))}
      </Grid>

      {/* ✅ Charts */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={7}>
          <UserOverviewChart users={users} />
        </Grid>
        <Grid item xs={12} md={5}>
          <RoleDistributionChart
            users={users}
            userRolesMap={userRolesMap}
          />
        </Grid>
      </Grid>

      {/* ✅ Recent Activity */}
      <Grid container>
        <Grid item xs={12}>
          <RecentActivityPanel users={users} roles={roles} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;