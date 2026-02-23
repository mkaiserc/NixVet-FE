'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tenantId');
    }
    router.push('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Meu Perfil',
        icon: <UserOutlined />,
      },
      {
        key: 'settings',
        label: <Link href="/dashboard/settings">Configurações</Link>,
        icon: <SettingOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: 'Sair',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const getSelectedKey = () => {
    if (pathname.includes('/dashboard/patients')) return 'patients';
    if (pathname.includes('/dashboard/owners')) return 'owners';
    if (pathname.includes('/dashboard/calendar')) return 'calendar';
    if (pathname.includes('/dashboard/settings')) return 'settings';
    if (pathname.includes('/dashboard/bulario')) return 'bulario';
    if (pathname.includes('/dashboard/prescriptions')) return 'prescriptions';
    if (pathname.includes('/dashboard/exams')) return 'exams';
    return 'dashboard';
  };

  return (
    <Layout className="min-h-screen bg-[#f1f5f9]">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        theme="light"
        className="!bg-white border-r border-slate-200/80 shadow-sm"
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div className="flex items-center h-16 px-4 border-b border-slate-200/80">
          <div className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
            <Logo
              width={collapsed ? 44 : 52}
              height={collapsed ? 44 : 52}
            />
            {!collapsed && (
              <span className="text-slate-800 font-semibold text-lg tracking-tight">NixVet</span>
            )}
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          className="border-0 mt-3 px-2 !bg-transparent"
          style={{ minHeight: 'calc(100vh - 64px)' }}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
            { key: 'patients', icon: <MedicineBoxOutlined />, label: <Link href="/dashboard/patients">Pacientes</Link> },
            { key: 'owners', icon: <TeamOutlined />, label: <Link href="/dashboard/owners">Tutores</Link> },
            { key: 'team', icon: <UserOutlined />, label: <Link href="/dashboard/team">Equipe</Link> },
            { key: 'prescriptions', icon: <MedicineBoxOutlined />, label: <Link href="/dashboard/prescriptions">Prescrição</Link> },
            { key: 'bulario', icon: <MedicineBoxOutlined />, label: <Link href="/dashboard/bulario">Bulário</Link> },
            { key: 'exams', icon: <FileSearchOutlined />, label: <Link href="/dashboard/exams">Exames</Link> },
            { key: 'calendar', icon: <CalendarOutlined />, label: <Link href="/dashboard/calendar">Agenda</Link> },
            { key: 'settings', icon: <SettingOutlined />, label: <Link href="/dashboard/settings">Configurações</Link> },
          ]}
        />
      </Sider>
      <Layout className={`transition-[margin-left] duration-200 ${collapsed ? 'ml-[80px]' : 'ml-[260px]'}`}>
        <Header
          className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200/80 shadow-sm"
          style={{ padding: 0 }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-12 h-12 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-xl"
          />
          <div className="flex items-center gap-3">
            <span className="text-slate-600 text-sm hidden sm:inline">
              Olá, <strong className="text-slate-800">Veterinário</strong>
            </span>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Avatar
                className="cursor-pointer border-2 border-white shadow-md hover:ring-2 hover:ring-blue-200"
                style={{ backgroundColor: '#2563eb' }}
                icon={<UserOutlined />}
                size="default"
              />
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 min-h-[calc(100vh-64px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
