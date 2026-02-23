'use client';

import React, { useState, useCallback } from 'react';
import { Table, Input, Card, Descriptions, Modal, Empty, Spin } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

interface BularioItem {
  id: string;
  title: string;
  subtitle: string | null;
  origin: string | null;
  link_details: string | null;
  details: Array<{ title: string; data: Array<{ title: string | null; data: string }> }> | null;
}

export default function BularioPage() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BularioItem[]>([]);
  const [query, setQuery] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<BularioItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const search = useCallback(
    async (q: string, limit = 50) => {
      setLoading(true);
      try {
        const response = await api.get<BularioItem[]>('/bulario', {
          params: { q: q || undefined, limit },
        });
        setDataSource(response.data || []);
      } catch (error) {
        console.error('Error searching bulario:', error);
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearch = () => search(query);

  const openDetail = async (id: string) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setDetailItem(null);
    try {
      const response = await api.get<BularioItem>(`/bulario/${id}`);
      setDetailItem(response.data);
    } catch (error) {
      console.error('Error loading bulario detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: 'Medicamento',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: BularioItem) => (
        <span className="font-medium">{title}</span>
      ),
    },
    {
      title: 'Subtítulo',
      dataIndex: 'subtitle',
      key: 'subtitle',
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: BularioItem) => (
        <a onClick={() => openDetail(record.id)} className="text-blue-600">
          <InfoCircleOutlined /> Ver detalhes
        </a>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <MedicineBoxOutlined /> Bulário – Consulta de Medicamentos
        </h1>
      </div>

      <Card className="mb-4">
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Buscar por nome do medicamento"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={handleSearch}
            className="max-w-md"
            allowClear
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90"
          >
            Buscar
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                search('', 50);
              }}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
            >
              Limpar
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Digite pelo menos 2 caracteres e clique em Buscar para listar os medicamentos.
        </p>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: loading ? <Spin /> : (
              <Empty description={query ? 'Nenhum medicamento encontrado.' : 'Use a busca acima para consultar o bulário.'} />
            ),
          }}
          pagination={
            dataSource.length > 0
              ? { pageSize: 20, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }
              : false
          }
        />
      </Card>

      <Modal
        title={detailItem?.title ?? 'Detalhes do medicamento'}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={720}
      >
        {detailLoading && <div className="flex justify-center py-8"><Spin /></div>}
        {!detailLoading && detailItem && (
          <div className="max-h-[70vh] overflow-y-auto">
            {detailItem.subtitle && (
              <p className="text-gray-600 mb-3">{detailItem.subtitle}</p>
            )}
            {detailItem.link_details && (
              <p className="text-sm mb-3">
                <a href={detailItem.link_details} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Link externo
                </a>
              </p>
            )}
            {detailItem.details && detailItem.details.length > 0 ? (
              detailItem.details.map((section, idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="font-semibold text-blue-600 mb-2">{section.title}</h4>
                  <Descriptions column={1} size="small" bordered>
                    {section.data?.map((item, i) => (
                      <Descriptions.Item key={i} label={item.title ?? '—'}>
                        {item.data || '—'}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </div>
              ))
            ) : (
              <Empty description="Sem detalhes cadastrados." />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
