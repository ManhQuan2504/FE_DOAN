import React, { useEffect, useState } from 'react';
import { Form, Input, Row, Col, Select, Tabs, InputNumber, Button, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGetById, apiGetList } from '~/services/helperServices';
import CreateButton from '~/components/manager/listAction/CreateButton';
import BackButton from '~/components/manager/listAction/BackButton';
import UpdateButton from '~/components/manager/listAction/UpdateButton';
import DeleteButton from '~/components/manager/listAction/DeleteButton';
import ProductSearch from '~/components/ProductFieldComponent';
import { COLOR_MENU } from '~/constants/colorConstants';
import { generateAutoCode } from '~/helper/functionHelper';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';

const { TabPane } = Tabs;
const { Option } = Select;

const getUniqueValues = (data, key) => {
  const values = data?.map(item => {
    const keys = key.split('.');
    let value = item;
    keys.forEach(k => {
      value = value ? value[k] : 'No Value';
    });
    return value;
  });

  return _.uniq(values).sort((a, b) => {
    const aValue = typeof a === 'string' ? a : '';
    const bValue = typeof b === 'string' ? b : '';
    return aValue.localeCompare(bValue);
  });
};

const SalesFormPage = () => {
  const { t } = useTranslation();
  const [sale, setSale] = useState({});
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState('');
  const [productData, setProductData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [salesDetail, setSalesDetail] = useState([]);
  const [pageSize, setPageSize] = useState(30);
  const [errorAddLineMessage, setErrorAddLineMessagee] = useState('');

  const formChange = async (changedValues, allValues) => {
    console.log("🚀 ~ form.getFieldsValue():", form.getFieldsValue());
  };

  const onColorChange = async (value) => {
    const { product } = form.getFieldsValue();
    const filteredProducts = productsData.filter(item => item._id === product && item.color === value);

    if (filteredProducts && filteredProducts.length) {
      form.setFieldsValue({
        qty: filteredProducts[0].qty,
      });
    } else {
      form.setFieldsValue({
        qty: 0,
      });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = {
        modelName: 'products',
        data: {},
      };
      const response = await apiGetList(data);
      setProductsData(response.dataObject);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (id && id !== '0') {
        const saleData = await apiGetById({ modelName: 'sales', id });
        setSale(saleData.dataObject);
        form.setFieldsValue(saleData.dataObject);
      } else {
        const autoCode = generateAutoCode('BH');

        const user = JSON.parse(localStorage.getItem('user'));
        setEmployeeName(user ? user.employeeName : '');
        form.setFieldsValue({
          employee: user ? user._id : '',
          saleNumber: autoCode,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchData();
  }, [id, form]);

  const addSaleLine = () => {
    const product = form.getFieldValue('product');
    console.log("🚀 ~ addSaleLine ~ product:", product)
    const color = form.getFieldValue('color');
    console.log("🚀 ~ addSaleLine ~ color:", color)
    const qty = form.getFieldValue('qty');
    console.log("🚀 ~ addSaleLine ~ qty:", qty)
    const saleQty = form.getFieldValue('saleQty');
    console.log("🚀 ~ addSaleLine ~ saleQty:", saleQty)
    const productDetails = productsData.find(item => item._id === product);

    if (product && color && saleQty) {
      const newSaleDetail = {
        productName: productDetails.productName,
        uomName: productDetails.uomName,
        saleQty: saleQty,
        price: productDetails.price,
        warranty: productDetails.warranty,
        product,
        color,
        qty,
      };
      setSalesDetail(prevDetails => [...prevDetails, newSaleDetail]);
      console.log("🚀 ~ SalesFormPage ~ salesDetail:", salesDetail)

      // Reset form fields in the salesProduct tab
      form.resetFields(['product', 'color', 'qty', 'saleQty']);
    }
  };

  const removeSaleLine = (index) => {
    setSalesDetail(prevDetails => prevDetails.filter((_, i) => i !== index));
  };

  const columnsConfig = [
    {
      title: t('productName'),
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: t('saleQty'),
      dataIndex: 'saleQty',
      width: 170,
      key: 'saleQty',
    },
    {
      title: t('price'),
      dataIndex: 'price',
      width: 170,
      key: 'price',
    },
    {
      title: t('warranty'),
      dataIndex: 'warranty',
      width: 170,
      key: 'warranty',
    },
    {
      title: '',
      key: 'action',
      width: 70, // Adjust the width of the "X" column here
      render: (text, record, index) => (
        <Button type="link" icon={<CloseOutlined />} onClick={() => removeSaleLine(index)}>
          
        </Button>
      ),
    },
  ];

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    console.log(`Page size changed to ${size}`);
  };

  const columns = [
    {
      title: t('index'),
      dataIndex: 'index',
      key: 'index',
      width: 70,
      render: (text, record, index) => index + 1,
    },
    ...columnsConfig.map(col => ({
      ...col,
      filters: getUniqueValues(salesDetail, col.key).map(value => ({ text: value, value })),
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value, record) => {
        const keys = col.key.split('.');
        let recordValue = record;
        keys.forEach(k => {
          recordValue = recordValue ? recordValue[k] : 'No Value';
        });
        return recordValue.startsWith(value);
      },
      sorter: (a, b) => {
        const keys = col.key.split('.');
        let aValue = a;
        let bValue = b;
        keys.forEach(k => {
          aValue = aValue ? aValue[k] : '';
          bValue = bValue ? bValue[k] : '';
        });
        return aValue.localeCompare(bValue);
      },
    })),
  ];

  return (
    <div>
      <div className="header-list">
        <div className="title">{t('sale')}</div>
        <div className="button-list">
          <BackButton />
          <UpdateButton form={form} navigate={navigate} id={id} modelName="sales" />
          <DeleteButton id={id} modelName="sales" />
          <CreateButton form={form} navigate={navigate} modelName="sales" />
        </div>
      </div>
      <Form form={form} layout="vertical" style={{ maxWidth: '100%' }} onValuesChange={formChange}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={t('salesInfor')} key="1">
            <Row gutter={[12]}>
              <Col span={6}>
                <Form.Item label={t('saleNumber')} name="saleNumber">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={t('employeeName')}>
                  <Input value={employeeName} readOnly />
                </Form.Item>
                <Form.Item name="employee" hidden>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={t('customer')} name="customer">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={t('phoneNumber')} name="phoneNumber">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <Tabs defaultActiveKey="1">
          <TabPane tab={t('salesProduct')} key="1">
            <Row gutter={[12]}>
              <Col span={6}>
                <Form.Item label={t('product')} name="product">
                  <ProductSearch form={form} name="product" initProducts={productData} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={t('color')} name="color">
                  <Select onChange={onColorChange}>
                    {COLOR_MENU.map(color => (
                      <Option key={color.name} value={color.name}>
                        {color.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={t('qty')} name="qty">
                  <InputNumber style={{ width: '100%' }} readOnly />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={t('saleQty')} name="saleQty">
                  <InputNumber style={{ width: '100%' }} defaultValue={0} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <Button onClick={addSaleLine}>{t('addSaleLine')}</Button>
                <div></div>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <Tabs defaultActiveKey="1">
          <TabPane tab={t('salesDetail')} key="1">
            <Table
              columns={columns}
              dataSource={salesDetail}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['30', '50', '100', '200'],
                onShowSizeChange: handlePageSizeChange,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
              }}
              scroll={{ y: 430 }}
              style={{ minHeight: '400px' }}
            />
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
};

export default SalesFormPage;
