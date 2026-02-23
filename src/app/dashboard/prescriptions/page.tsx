'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Space, Tooltip, Descriptions, Spin, Radio, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, FilePdfOutlined, MedicineBoxOutlined, MinusCircleOutlined, MailOutlined, InfoCircleOutlined, ExperimentOutlined, FileSearchOutlined } from '@ant-design/icons';
import api from '@/lib/axios';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const FORM_ADMIN_OPTIONS = [
  { value: 'oral', label: 'Oral' },
  { value: 'topica', label: 'Tópica' },
  { value: 'colirio', label: 'Colírio' },
  { value: 'spray', label: 'Spray' },
  { value: 'injetavel', label: 'Injetável' },
  { value: 'outro', label: 'Outro' },
];
const USE_TYPE_OPTIONS = [
  { value: 'veterinario', label: 'Uso veterinário' },
  { value: 'humano', label: 'Uso humano' },
];
const FREQUENCY_UNIT_OPTIONS = [
  { value: 'minutos', label: 'minutos' },
  { value: 'horas', label: 'horas' },
  { value: 'dias', label: 'dias' },
];
const DURATION_UNIT_OPTIONS = [
  { value: 'dias', label: 'dias' },
  { value: 'semanas', label: 'semanas' },
  { value: 'meses', label: 'meses' },
];

interface Prescription {
  id: string;
  createdAt: string;
  consultation?: { patient?: { id: string; name: string; tutor?: { name: string } } };
  patient?: { id: string; name: string; tutor?: { name: string } };
  patient_id?: string;
  veterinarian: { name: string };
  prescription_type?: string;
}

interface BularioItem {
  id: string;
  title: string;
  subtitle?: string | null;
  details?: Array<{ title: string; data: Array<{ title: string | null; data: string }> }> | null;
  link_details?: string | null;
}

interface PatientOption {
  id: string;
  name: string;
  species: string;
  tutor?: { name: string };
}

interface ConsultationOption {
  id: string;
  consultation_date: string;
  patient?: { name: string };
  veterinarian?: { name: string };
}

interface SurgicalProcedureOption {
  id: number;
  name: string;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [consultationsByPatient, setConsultationsByPatient] = useState<ConsultationOption[]>([]);
  const [surgicalProcedures, setSurgicalProcedures] = useState<SurgicalProcedureOption[]>([]);
  const [form] = Form.useForm();

  const [bularioOptions, setBularioOptions] = useState<BularioItem[]>([]);
  const [searchingBulario, setSearchingBulario] = useState(false);

  const [prescriptionType, setPrescriptionType] = useState<'receita' | 'solicitacao_cirurgia'>('receita');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const searchBulario = async (value: string) => {
    if (!value || value.length < 2) {
      setBularioOptions([]);
      return;
    }
    setSearchingBulario(true);
    try {
      const response = await api.get('/bulario', { params: { q: value, limit: 20 } });
      setBularioOptions(response.data);
    } catch (error) {
      message.error('Erro ao buscar no bulário');
    } finally {
      setSearchingBulario(false);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/prescriptions');
      setPrescriptions(response.data);
    } catch (error) {
      message.error('Erro ao carregar prescrições');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConsultationsForPatient = async (patientId: string) => {
    try {
      const response = await api.get('/consultations');
      const all = (response.data ?? []).filter((c: any) => c.patient_id === patientId || c.patient?.id === patientId);
      setConsultationsByPatient(all);
    } catch (error) {
      setConsultationsByPatient([]);
    }
  };

  const fetchSurgicalProcedures = async () => {
    try {
      const response = await api.get('/catalog/surgical-procedures');
      setSurgicalProcedures(response.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchSurgicalProcedures();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setPrescriptionType('receita');
    setSelectedPatientId(null);
    setConsultationsByPatient([]);
    setModalVisible(true);
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId || null);
    form.setFieldsValue({ consultation_id: undefined, prescription_date: undefined });
    if (patientId) fetchConsultationsForPatient(patientId);
    else setConsultationsByPatient([]);
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescricao-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Erro ao baixar PDF');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        message.error('Usuário não autenticado');
        return;
      }
      const user = JSON.parse(userStr);

      if (!values.consultation_id && !values.prescription_date) {
        message.error('Selecione uma consulta ou informe a data da prescrição');
        return;
      }

      const payload: any = {
        veterinarian_id: user.id,
        prescription_type: prescriptionType,
        observations: values.observations,
      };

      if (values.consultation_id) {
        payload.consultation_id = values.consultation_id;
      } else {
        payload.patient_id = values.patient_id;
        payload.prescription_date = values.prescription_date ? dayjs(values.prescription_date).format('YYYY-MM-DD') : null;
      }

      if (prescriptionType === 'receita') {
        payload.medications = (values.medications ?? []).map((m: any) => ({
          name: m.name,
          via: m.via,
          concentration: m.concentration,
          use_type: m.use_type,
          form_of_administration: m.form_of_administration,
          dosage: m.dosage,
          frequency_value: m.frequency_value,
          frequency_unit: m.frequency_unit,
          duration_value: m.duration_value,
          duration_unit: m.duration_unit,
          usage_description: m.usage_description,
          observations: m.observations,
          bulario_item_id: m.bulario_item_id,
        }));
      } else {
        payload.medications = [];
        if (values.surgical_procedure_ids?.length) {
          payload.surgical_procedures = values.surgical_procedure_ids.map((id: number) => {
            const p = surgicalProcedures.find((s) => s.id === id);
            return { id, name: p?.name ?? `ID ${id}` };
          });
        }
      }

      await api.post('/prescriptions', payload);
      message.success('Prescrição gerada com sucesso');
      setModalVisible(false);
      fetchPrescriptions();
    } catch (error) {
      message.error('Erro ao gerar prescrição');
    }
  };

  const getPatient = (record: Prescription) => record.consultation?.patient ?? record.patient;
  const getTutorName = (record: Prescription) => getPatient(record)?.tutor?.name ?? '—';

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [bularioDetailVisible, setBularioDetailVisible] = useState(false);
  const [bularioDetail, setBularioDetail] = useState<BularioItem | null>(null);
  const [bularioDetailLoading, setBularioDetailLoading] = useState(false);

  const openBularioDetail = async (id: string) => {
    setBularioDetailVisible(true);
    setBularioDetailLoading(true);
    setBularioDetail(null);
    try {
      const response = await api.get<BularioItem>(`/bulario/${id}`);
      setBularioDetail(response.data);
    } catch (error) {
      message.error('Erro ao carregar detalhes do medicamento');
    } finally {
      setBularioDetailLoading(false);
    }
  };

  const handleOpenEmailModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setEmailModalVisible(true);
  };

  const handleSendEmail = async () => {
    if (!selectedPrescription) return;
    try {
      await api.post(`/prescriptions/${selectedPrescription.id}/email`);
      message.success('Email enviado com sucesso');
      setEmailModalVisible(false);
    } catch (error) {
      message.error('Erro ao enviar email');
    }
  };

  const handleSolicitarExame = (record: Prescription) => {
    const patient = getPatient(record);
    const patientId = record.consultation?.patient?.id ?? record.patient?.id ?? record.patient_id;
    if (patientId) router.push(`/dashboard/exams?patientId=${patientId}`);
    else router.push('/dashboard/exams');
  };

  const columns = [
    { title: 'Data', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString('pt-BR') },
    { title: 'Paciente', key: 'patient', render: (_: any, record: Prescription) => getPatient(record)?.name ?? '—' },
    { title: 'Tutor', key: 'tutor', render: (_: any, record: Prescription) => getTutorName(record) },
    { title: 'Veterinário', dataIndex: ['veterinarian', 'name'], key: 'veterinarian' },
    {
      title: 'Tipo',
      key: 'type',
      render: (_: any, record: Prescription) => (record.prescription_type === 'solicitacao_cirurgia' ? 'Cirurgia' : 'Receita'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Prescription) => (
        <Space>
          <Tooltip title="Baixar PDF">
            <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadPdf(record.id)} className="text-red-500 border-red-500 hover:bg-red-50">PDF</Button>
          </Tooltip>
          <Tooltip title="Enviar por Email">
            <Button icon={<MailOutlined />} onClick={() => handleOpenEmailModal(record)} className="text-blue-500 border-blue-500 hover:bg-blue-50">Email</Button>
          </Tooltip>
          <Tooltip title="Solicitar exame">
            <Button icon={<FileSearchOutlined />} onClick={() => handleSolicitarExame(record)} className="text-green-600 border-green-600 hover:bg-green-50">Exame</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <MedicineBoxOutlined /> Prescrição
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-blue-600">
          Nova Prescrição
        </Button>
      </div>

      <Table columns={columns} dataSource={prescriptions} rowKey="id" loading={loading} />

      <Modal
        title="Nova Prescrição"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="patient_id" label="Paciente" rules={[{ required: true, message: 'Selecione o paciente' }]}>
            <Select
              showSearch
              placeholder="Buscar paciente"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.species}) - ${p.tutor?.name ?? ''}` }))}
              onChange={handlePatientChange}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.patient_id !== curr.patient_id}>
            {({ getFieldValue }) =>
              getFieldValue('patient_id') ? (
                <>
                  <Form.Item
                    name="consultation_id"
                    label="Consulta (opcional)"
                    help="Se não houver consulta, preencha a data abaixo"
                  >
                    <Select
                      placeholder="Selecione a consulta ou deixe em branco"
                      allowClear
                      options={consultationsByPatient.map((c) => ({
                        value: c.id,
                        label: `${new Date(c.consultation_date).toLocaleDateString('pt-BR')} - Dr. ${c.veterinarian?.name ?? ''}`,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    name="prescription_date"
                    label="Data da prescrição (quando não houver consulta)"
                    help="Obrigatório se não selecionar uma consulta"
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

          <Form.Item name="prescription_type" label="Tipo" initialValue="receita">
            <Radio.Group onChange={(e) => setPrescriptionType(e.target.value)} value={prescriptionType}>
              <Radio value="receita">Receita / Medicamentos</Radio>
              <Radio value="solicitacao_cirurgia">Solicitação de cirurgia</Radio>
            </Radio.Group>
          </Form.Item>

          {prescriptionType === 'solicitacao_cirurgia' && (
            <Form.Item name="surgical_procedure_ids" label="Procedimentos cirúrgicos" rules={[{ required: true, message: 'Selecione ao menos um procedimento' }]}>
              <Select
                mode="multiple"
                placeholder="Selecione os procedimentos"
                options={surgicalProcedures.map((s) => ({ value: s.id, label: s.name }))}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
          )}

          {prescriptionType === 'receita' && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h3 className="font-bold mb-2">Medicamentos</h3>
              <Form.List name="medications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="border rounded p-3 mb-3 bg-white">
                        <Form.Item name={[name, 'bulario_item_id']} hidden><Input type="hidden" /></Form.Item>
                        <div className="flex flex-wrap gap-2 items-start mb-2">
                          <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]} className="mb-0" style={{ minWidth: 200 }}>
                            <Select
                              showSearch
                              placeholder="Medicamento"
                              filterOption={false}
                              onSearch={searchBulario}
                              onChange={(title) => {
                                const item = bularioOptions.find((o) => o.title === title);
                                form.setFieldValue(['medications', name, 'bulario_item_id'], item?.id);
                              }}
                              notFoundContent={searchingBulario ? 'Buscando...' : null}
                              options={bularioOptions.map((item) => ({ value: item.title, label: item.title }))}
                            />
                          </Form.Item>
                          <Form.Item noStyle shouldUpdate={(prev, curr) => prev?.medications?.[name]?.bulario_item_id !== curr?.medications?.[name]?.bulario_item_id}>
                            {({ getFieldValue }) => {
                              const id = getFieldValue(['medications', name, 'bulario_item_id']);
                              return id ? (
                                <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={() => openBularioDetail(id)}>Detalhes</Button>
                              ) : null;
                            }}
                          </Form.Item>
                          <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Form.Item {...restField} name={[name, 'via']} label="Via" className="mb-0"><Input placeholder="Via" /></Form.Item>
                          <Form.Item {...restField} name={[name, 'concentration']} label="Concentração" className="mb-0"><Input placeholder="ex: 10mg/ml" /></Form.Item>
                          <Form.Item {...restField} name={[name, 'use_type']} label="Uso" className="mb-0">
                            <Select placeholder="Uso" allowClear options={USE_TYPE_OPTIONS} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'form_of_administration']} label="Forma de administração" className="mb-0">
                            <Select placeholder="Forma" allowClear options={FORM_ADMIN_OPTIONS} />
                          </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Form.Item {...restField} name={[name, 'dosage']} label="Dose" className="mb-0"><Input placeholder="Dose" /></Form.Item>
                          <Form.Item {...restField} name={[name, 'frequency_value']} label="Frequência (valor)" className="mb-0"><InputNumber min={1} placeholder="Ex: 12" style={{ width: '100%' }} /></Form.Item>
                          <Form.Item {...restField} name={[name, 'frequency_unit']} label="Frequência (unidade)" className="mb-0">
                            <Select placeholder="Unidade" allowClear options={FREQUENCY_UNIT_OPTIONS} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'duration_value']} label="Duração (valor)" className="mb-0"><InputNumber min={1} placeholder="Ex: 7" style={{ width: '100%' }} /></Form.Item>
                          <Form.Item {...restField} name={[name, 'duration_unit']} label="Duração (unidade)" className="mb-0">
                            <Select placeholder="Unidade" allowClear options={DURATION_UNIT_OPTIONS} />
                          </Form.Item>
                        </div>
                        <Form.Item {...restField} name={[name, 'usage_description']} label="Descrição de como usar" className="mb-0">
                          <Input.TextArea rows={2} placeholder="Ex: Administrar com alimento. Manter na geladeira." />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'observations']} label="Observações" className="mb-0"><Input placeholder="Obs." /></Form.Item>
                      </div>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Adicionar medicamento</Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          )}

          <Form.Item name="observations" label="Recomendações gerais"><Input.TextArea rows={3} /></Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-blue-600">Gerar prescrição</Button>
              <Button onClick={() => setModalVisible(false)}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Confirmar Envio de Email" open={emailModalVisible} onCancel={() => setEmailModalVisible(false)} onOk={handleSendEmail} okText="Enviar" cancelText="Cancelar">
        <p>Enviar prescrição por email para o tutor de <strong>{selectedPrescription && getPatient(selectedPrescription)?.name}</strong>?</p>
        <p className="text-gray-500 text-sm mt-2">O email será enviado para o endereço cadastrado no perfil do tutor.</p>
      </Modal>

      <Modal title={bularioDetail?.title ?? 'Detalhes do medicamento'} open={bularioDetailVisible} onCancel={() => setBularioDetailVisible(false)} footer={null} width={640}>
        {bularioDetailLoading && <div className="flex justify-center py-8"><Spin /></div>}
        {!bularioDetailLoading && bularioDetail && (
          <div className="max-h-[60vh] overflow-y-auto">
            {bularioDetail.subtitle && <p className="text-gray-600 mb-2">{bularioDetail.subtitle}</p>}
            {bularioDetail.link_details && <a href={bularioDetail.link_details} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm block mb-3">Link externo</a>}
            {bularioDetail.details?.length ? (
              bularioDetail.details.map((section, idx) => (
                <div key={idx} className="mb-3">
                  <h4 className="font-semibold text-blue-600 text-sm mb-1">{section.title}</h4>
                  <Descriptions column={1} size="small" bordered>
                    {section.data?.map((item, i) => (
                      <Descriptions.Item key={i} label={item.title ?? '—'}>{item.data || '—'}</Descriptions.Item>
                    ))}
                  </Descriptions>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Sem detalhes cadastrados.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
