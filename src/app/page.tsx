'use client';

import React from 'react';
import { Button, Layout, Typography, Card, Row, Col, Space } from 'antd';
import { 
  MedicineBoxOutlined, 
  SafetyCertificateOutlined, 
  FilePdfOutlined, 
  CloudServerOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import Logo from '@/components/Logo';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

export default function LandingPage() {
  return (
    <Layout className="min-h-screen bg-white">
      {/* Header */}
      <Header className="flex items-center justify-between px-6 md:px-12 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 h-20">
        <div className="flex items-center gap-3">
          <Logo width={40} height={40} />
          <span className="text-2xl font-bold text-[#13364F] tracking-tight">NixVetApp</span>
        </div>
        <Space>
          <Link href="/login">
            <Button type="primary" size="large" className="bg-[#13364F] hover:bg-[#1a4a6b] border-none shadow-md rounded-full px-8">
              Acessar Sistema
            </Button>
          </Link>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#f0f5ff] to-white py-24 px-6 md:px-12 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="mb-8 inline-block px-4 py-1.5 rounded-full bg-blue-50 text-[#13364F] font-medium text-sm border border-blue-100">
              🚀 A plataforma definitiva para veterinários
            </div>
            <Title level={1} className="text-[#13364F] mb-6 !text-5xl md:!text-7xl font-extrabold tracking-tight">
              Gestão Veterinária <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13364F] to-[#C29A5A]">
                Profissional e Segura
              </span>
            </Title>
            <Paragraph className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Simplifique sua rotina clínica com o NixVetApp. Prontuários eletrônicos, 
              receitas digitais inteligentes e conformidade LGPD em uma interface moderna.
            </Paragraph>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <Button type="primary" size="large" className="h-14 px-10 text-lg bg-[#13364F] rounded-full hover:scale-105 transition-transform">
                  Começar Agora
                </Button>
              </Link>
              <Button size="large" className="h-14 px-10 text-lg rounded-full border-gray-300 hover:border-[#13364F] hover:text-[#13364F]">
                Agendar Demonstração
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Title level={2} className="text-[#13364F] !text-3xl md:!text-4xl font-bold">Por que escolher o NixVetApp?</Title>
            <Paragraph className="text-gray-500 text-xl max-w-2xl mx-auto mt-4">
              Tecnologia de ponta desenvolvida para otimizar cada aspecto da sua clínica.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full shadow-sm hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl group">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#C29A5A] text-3xl mb-6 group-hover:scale-110 transition-transform">
                  <MedicineBoxOutlined />
                </div>
                <Title level={4} className="!mb-3">Gestão Clínica</Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  Prontuário completo com anamnese, histórico e exame físico. Tudo organizado por paciente e tutor.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full shadow-sm hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#13364F] text-3xl mb-6 group-hover:scale-110 transition-transform">
                  <SafetyCertificateOutlined />
                </div>
                <Title level={4} className="!mb-3">Segurança LGPD</Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  Dados sensíveis criptografados (AES-256), consentimento de tutores e logs de auditoria completos.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full shadow-sm hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl group">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#C29A5A] text-3xl mb-6 group-hover:scale-110 transition-transform">
                  <FilePdfOutlined />
                </div>
                <Title level={4} className="!mb-3">Docs Inteligentes</Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  Receitas e solicitações de exames em PDF com assinatura digital e envio automático por e-mail.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full shadow-sm hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#13364F] text-3xl mb-6 group-hover:scale-110 transition-transform">
                  <CloudServerOutlined />
                </div>
                <Title level={4} className="!mb-3">Arquitetura SaaS</Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  Multi-tenant, escalável e disponível 24/7. Seus dados seguros e acessíveis de qualquer lugar.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-[#13364F] rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C29A5A]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <Title level={2} className="!text-white mb-6 !text-3xl md:!text-5xl font-bold relative z-10">
              Pronto para transformar sua clínica?
            </Title>
            <Paragraph className="text-white/80 text-xl mb-10 max-w-2xl mx-auto relative z-10">
              Junte-se a veterinários que já modernizaram seus atendimentos com o NixVetApp.
            </Paragraph>
            <Link href="/login" className="relative z-10">
              <Button size="large" className="h-14 px-12 text-lg bg-[#C29A5A] border-none text-white hover:bg-[#d4a863] rounded-full shadow-lg">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </Content>

      <Footer className="text-center bg-white text-gray-500 py-12 border-t border-gray-100">
        <div className="mb-4">
          <Logo width={32} height={32} className="inline-block opacity-50 grayscale hover:grayscale-0 transition-all" />
        </div>
        NixVetApp ©{new Date().getFullYear()} - Todos os direitos reservados.
      </Footer>
    </Layout>
  );
}
