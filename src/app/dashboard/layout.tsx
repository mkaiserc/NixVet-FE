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
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    // Clear token logic here
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
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Sair',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  // Determine selected key based on pathname
  const getSelectedKey = () => {
    if (pathname.includes('/dashboard/patients')) return 'patients';
    if (pathname.includes('/dashboard/owners')) return 'owners';
    if (pathname.includes('/dashboard/calendar')) return 'calendar';
    if (pathname.includes('/dashboard/settings')) return 'settings';
    return 'dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="dark" 
        width={250} 
        style={{ 
          background: '#13364F',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
        }}
      >
        <div className="flex items-center justify-center py-6">
          <div className={`transition-all duration-300 flex items-center gap-2 ${collapsed ? 'justify-center' : 'px-4'}`}>
            <Logo 
              width={collapsed ? 32 : 40} 
              height={collapsed ? 32 : 40} 
              color="#ffffff" 
              accent="#C29A5A"
            />
            {!collapsed && (
              <span className="text-white text-xl font-bold tracking-wide">NixVetApp</span>
            )}
          </div>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{ background: '#13364F', borderRight: 0 }}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link href="/dashboard">Dashboard</Link>,
            },
            {
              key: 'patients',
              icon: <MedicineBoxOutlined />,
              label: <Link href="/dashboard/patients">Pacientes</Link>,
            },
            {
              key: 'owners',
              icon: <TeamOutlined />,
              label: <Link href="/dashboard/owners">Tutores</Link>,
            },
            {
              key: 'team',
              icon: <UserOutlined />,
              label: <Link href="/dashboard/team">Equipe</Link>,
            },
            {
              key: 'prescriptions',
              icon: <MedicineBoxOutlined />,
              label: <Link href="/dashboard/prescriptions">Receitas</Link>,
            },
            {
              key: 'exams',
              icon: <FileSearchOutlined />,
              label: <Link href="/dashboard/exams">Exames</Link>,
            },
            {
              key: 'calendar',
              icon: <CalendarOutlined />,
              label: <Link href="/dashboard/calendar">Agenda</Link>,
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: <Link href="/dashboard/settings">Configurações</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-6 shadow-sm z-10 sticky top-0">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600 hidden md:inline-block">Bem-vindo, <strong>Dr. Veterinário</strong></span>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Avatar 
                style={{ 
                  backgroundColor: '#C29A5A', 
                  cursor: 'pointer',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
                icon={<UserOutlined />} 
                size="large"
              />
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: 'transparent',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
