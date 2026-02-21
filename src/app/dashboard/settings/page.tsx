'use client';

import React from 'react';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

export default function SettingsPage() {
  const [form] = Form.useForm();

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tenants/me');
      const data = response.data;
      
      form.setFieldsValue({
        clinicName: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      message.loading({ content: 'Salvando configurações...', key: 'saving' });
      
      await api.put('/tenants/me', {
        name: values.clinicName,
        email: values.email,
        phone: values.phone,
        address: values.address,
      });

      message.success({ content: 'Configurações salvas com sucesso!', key: 'saving' });
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error({ content: 'Erro ao salvar configurações', key: 'saving' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#13364F] flex items-center gap-2 mb-6">
        <SettingOutlined /> Configurações
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Dados da Clínica" className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item name="clinicName" label="Nome da Clínica">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email de Contato">
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Telefone">
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Endereço">
              <Input.TextArea rows={2} />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="bg-[#13364F]">
                Salvar Alterações
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Sistema" className="shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-gray-700">Versão do Sistema</h4>
              <p className="text-gray-500">v1.0.0</p>
            </div>
            <Divider />
            <div>
              <h4 className="font-bold text-gray-700">Tenant ID</h4>
              <p className="text-gray-500 font-mono text-xs bg-gray-100 p-2 rounded">
                {typeof window !== 'undefined' ? localStorage.getItem('tenantId') : 'Loading...'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
