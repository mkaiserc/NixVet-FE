'use client';

import React from 'react';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { SettingOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import axios from 'axios';
import { MaskedInput } from 'antd-mask-input';

export default function SettingsPage() {
  const [form] = Form.useForm();

  const [loading, setLoading] = React.useState(false);
  const [loadingCep, setLoadingCep] = React.useState(false);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tenants/me');
      const data = response.data;

      let street = '';
      let number = '';
      let complement = '';
      let neighborhood = '';
      let city = '';
      let state = '';

      if (data.address) {
        const parts = data.address.split(' - ');

        if (parts.length >= 3) {
          const firstPart = parts[0].split(',');
          street = firstPart[0];
          number = firstPart[1] ? firstPart[1].trim() : '';

          if (parts.length >= 4) {
            complement = parts[1];
            neighborhood = parts[2];
            const cityState = parts[3].split('/');
            city = cityState[0];
            state = cityState[1] || '';
          } else {
            neighborhood = parts[1];
            const cityState = parts[2].split('/');
            city = cityState[0];
            state = cityState[1] || '';
          }
        }
      }

      form.setFieldsValue({
        clinicName: data.name,
        email: data.email,
        phone: data.phone,
        cep: data.cep || '',
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleCepSearch = async () => {
    const cepValue = form.getFieldValue('cep');
    if (!cepValue) return;

    const cep = cepValue.replace(/\D/g, '');
    if (cep.length !== 8) {
      message.warning('CEP inválido');
      return;
    }

    form.setFieldsValue({
      street: '',
      neighborhood: '',
      city: '',
      state: '',
    });

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        message.error('CEP não encontrado');
        return;
      }

      const { logradouro, bairro, localidade, uf } = response.data;

      form.setFieldsValue({
        street: logradouro,
        neighborhood: bairro,
        city: localidade,
        state: uf,
      });
    } catch (error) {
      console.error('Error fetching CEP:', error);
      message.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      message.loading({ content: 'Salvando configurações...', key: 'saving' });

      const fullAddress = values.street
        ? `${values.street}, ${values.number}${values.complement ? ` - ${values.complement}` : ''} - ${values.neighborhood} - ${values.city}/${values.state}`
        : values.address || '';

      await api.put('/tenants/me', {
        name: values.clinicName,
        email: values.email,
        phone: values.phone,
        address: fullAddress,
        cep: values.cep,
      });

      message.success({ content: 'Configurações salvas com sucesso!', key: 'saving' });
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error({ content: 'Erro ao salvar configurações', key: 'saving' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2 mb-6">
        <SettingOutlined /> Configurações
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Dados da Clínica" className="shadow-sm">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="clinicName" label="Nome da Clínica">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email de Contato">
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Telefone">
              <Input />
            </Form.Item>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Form.Item label="CEP">
                  <div className="flex gap-2">
                    <Form.Item name="cep" noStyle>
                      <MaskedInput mask="00000-000" disabled={loadingCep} className="w-full" />
                    </Form.Item>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleCepSearch}
                      disabled={loadingCep}
                      className="bg-blue-600"
                    />
                  </div>
                </Form.Item>
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-3 gap-2">
                  <Form.Item name="street" label="Logradouro" className="col-span-2">
                    <Input placeholder="Rua, Av, etc" />
                  </Form.Item>
                  <Form.Item name="number" label="Número">
                    <Input placeholder="123" />
                  </Form.Item>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Form.Item name="complement" label="Complemento">
                <Input placeholder="Apto 101" />
              </Form.Item>
              <Form.Item name="neighborhood" label="Bairro">
                <Input />
              </Form.Item>
              <Form.Item name="city" label="Cidade">
                <Input />
              </Form.Item>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Form.Item name="state" label="UF">
                <Input maxLength={2} />
              </Form.Item>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="bg-blue-600">
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
