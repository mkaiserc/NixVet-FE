'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, message } from 'antd';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import api from '@/lib/axios';

const { Title } = Typography;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    newPatients: 0,
    revenueToday: 0,
    totalAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real app, we would have a dedicated dashboard endpoint
      // For now, let's fetch consultations and calculate locally
      const consultationsRes = await api.get('/consultations');
      const patientsRes = await api.get('/patients');
      
      const consultations = consultationsRes.data;
      const patients = patientsRes.data;

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Appointments Today
      const todayAppointments = consultations.filter((c: any) => 
        c.consultation_date.startsWith(todayStr)
      );

      // Revenue Today
      const revenue = todayAppointments.reduce((acc: number, curr: any) => {
        return acc + (parseFloat(curr.price) || 0);
      }, 0);

      // New Patients (mock logic: created_at today)
      const newPatientsCount = patients.filter((p: any) => 
        p.createdAt.startsWith(todayStr)
      ).length;

      setStats({
        appointmentsToday: todayAppointments.length,
        newPatients: newPatientsCount,
        revenueToday: revenue,
        totalAppointments: consultations.length
      });

      // Recent Appointments List
      const recent = consultations
        .sort((a: any, b: any) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())
        .slice(0, 5)
        .map((c: any) => ({
          key: c.id,
          time: new Date(c.consultation_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(c.consultation_date).toLocaleDateString('pt-BR'),
          patient: c.patient?.name || 'N/A',
          owner: c.patient?.tutor?.name || 'N/A', // If tutor is included
          veterinarian: c.veterinarian?.name || 'N/A',
          status: new Date(c.consultation_date) < new Date() ? 'Realizado' : 'Agendado'
        }));

      setRecentAppointments(recent);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // message.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Horário',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Paciente',
      dataIndex: 'patient',
      key: 'patient',
    },
    {
      title: 'Veterinário',
      dataIndex: 'veterinarian',
      key: 'veterinarian',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'geekblue';
        if (status === 'Realizado') {
          color = 'green';
        } else if (status === 'Cancelado') {
          color = 'volcano';
        } else if (status === 'Agendado') {
          color = 'gold';
        }
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={2} className="!mb-6 text-[#13364F]">Visão Geral</Title>
      
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" loading={loading}>
            <Statistic
              title="Atendimentos Hoje"
              value={stats.appointmentsToday}
              prefix={<MedicineBoxOutlined className="text-[#13364F]" />}
              valueStyle={{ color: '#13364F' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" loading={loading}>
            <Statistic
              title="Pacientes Novos (Hoje)"
              value={stats.newPatients}
              prefix={<UserOutlined className="text-[#C29A5A]" />}
              valueStyle={{ color: '#C29A5A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" loading={loading}>
            <Statistic
              title="Receita do Dia"
              value={stats.revenueToday}
              precision={2}
              prefix="R$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" loading={loading}>
            <Statistic
              title="Total Agendamentos"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined className="text-blue-400" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Últimos Agendamentos" bordered={false} className="shadow-sm" loading={loading}>
            <Table 
              columns={columns} 
              dataSource={recentAppointments} 
              pagination={false} 
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Avisos Rápidos" bordered={false} className="shadow-sm h-full">
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                <h4 className="font-bold text-blue-700">Reunião de Equipe</h4>
                <p className="text-sm text-blue-600">Lembrete do sistema (Estático)</p>
              </div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
                <h4 className="font-bold text-yellow-700">Estoque Baixo</h4>
                <p className="text-sm text-yellow-600">Vacina V10 (Simulação)</p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r">
                <h4 className="font-bold text-green-700">Sistema Atualizado</h4>
                <p className="text-sm text-green-600">Versão 1.0.2</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
