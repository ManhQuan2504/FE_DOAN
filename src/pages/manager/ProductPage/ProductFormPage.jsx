import React, { useEffect, useState } from 'react';
import { Form, Input, Row, Col, Select, InputNumber, Switch, Upload, message, Button, Radio } from 'antd';
import CreateButton from '~/components/manager/listAction/CreateButton';
import { useTranslation } from 'react-i18next';
import { apiCreate, apiGetById, apiGetList, apiUpload } from '~/services/helperServices';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '~/components/manager/listAction/BackButton';
import UpdateButton from '~/components/manager/listAction/UpdateButton';
import DeleteButton from '~/components/manager/listAction/DeleteButton';
import ImageUpload from '~/components/uploadComponent';
import * as Style from "./styles";

const { Option } = Select;
const { TextArea } = Input;

const ProductFormPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [product, setProduct] = useState();
  console.log("🚀 ~ ProductFormPage ~ product:", product)
  const [taxs, setTaxs] = useState([]);
  console.log("🚀 ~ ProductFormPage ~ taxs:", taxs)
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  //nút tạo sp: gửi api upload ảnh => tạo sp
  const CreateProductButton = ({ modelName, form, navigate, ...props }) => {
    const { t } = useTranslation();

    const handleCreate = async () => {
      try {
        const formData = await form.getFieldValue();
        const uploadedImage = await apiUpload(formData.images)
        if (uploadedImage && uploadedImage?.length > 0) {
          delete formData.images;
          const data = {
            modelName: modelName,
            data: {
              ...formData,
              images: uploadedImage,
            },
          };
          await apiCreate(data);
          message.success(t('messages.createSuccess'));
          navigate(-1); // Navigate back to the previous page
        }

      } catch (error) {
        message.error(t('messages.createFail'));
      }
    };

    return (
      <Button
        type="primary"
        onClick={handleCreate}
        {...props}
      >
        {t('button.create')}
      </Button>
    );
  };

  const formChange = async (changedValues, allValues) => {
    console.log("🚀 ~ form.getFieldsValue():", form.getFieldsValue());
    // console.log("🚀 ~ allValues:", allValues);
  };

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const data = {
        modelName: 'categories',
        data: {},
      };
      const response = await apiGetList(data);
      setCategories(response.dataObject);
    } catch (error) {
      console.error('Failed to fetch Category:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUoms = async () => {
    setLoading(true);
    try {
      const data = {
        modelName: 'uoms',
        data: {},
      };
      const response = await apiGetList(data);
      setUoms(response.dataObject);
    } catch (error) {
      console.error('Failed to fetch uoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxs = async () => {
    setLoading(true);
    try {
      const data = {
        modelName: 'taxs',
        data: {},
      };
      const response = await apiGetList(data);
      setTaxs(response.dataObject);
    } catch (error) {
      console.error('Failed to fetch taxs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (id && id !== '0') {
        const productData = await apiGetById({ modelName: 'products', id });
        setProduct(productData.dataObject);
        form.setFieldsValue({
          ...productData.dataObject,
          uom: productData.dataObject.uom._id,
          tax: productData.dataObject.tax._id,
          brand: productData.dataObject.brand._id,
          category: productData.dataObject.category._id,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLOR_MENU = [
    {
      name: "đen",
      code: "000000",
    },
    {
      name: "trắng",
      code: "ffffff",
    },
    {
      name: "xám",
      code: "808080",
    },
    {
      name: "bạc",
      code: "c0c0c0",
    },
    {
      name: "đỏ",
      code: "e7352b",
    },
    {
      name: "xanh dương",
      code: "1790c8",
    },
    {
      name: "nâu",
      code: "825d41",
    },
    {
      name: "vàng",
      code: "fed533",
    },
    {
      name: "hồng",
      code: "ff69b4",
    },
    {
      name: "tím",
      code: "800080",
    },
    {
      name: "xanh ngọc",
      code: "00ced1",
    },
    {
      name: "be",
      code: "f5f5dc",
    },
    {
      name: "xanh navy",
      code: "000080",
    },
    {
      name: "nhiều màu",
      code: "multiColor",
    },
  ];
  
  function renderOptionColor() {
    return COLOR_MENU.map((colorItem, colorIndex) => {
      return (
        <Style.CustomRadio value={colorItem.code}>
          {colorItem.code === "ffffff" || colorItem.code === "multiColor" ? (
            <Style.CustomTag>{colorItem.name}</Style.CustomTag>
          ) : (
            <Style.CustomTag color={`#${colorItem.code}`}>
              {colorItem.name}
            </Style.CustomTag>
          )}
        </Style.CustomRadio>
      );
    });
  }

  useEffect(() => {
    fetchCategory();
    fetchUoms();
    fetchTaxs();
    fetchData();

    // return () => {
    //   form.resetFields();
    // };
  }, [id, form]);

  return (
    <div>
      <div className="header-list">
        <div className="title">{t('product')}</div>
        <div className="button-list">
          <BackButton />
          <UpdateButton form={form} navigate={navigate} id={id} modelName="products" />
          <DeleteButton id={id} modelName="products" />
          <CreateProductButton form={form} navigate={navigate} modelName="products" />
        </div>
      </div>
      <Form form={form} layout="vertical" style={{ maxWidth: '100%' }} onValuesChange={formChange}>
        <Row gutter={[12]}>
          <Col span={6}>
            <Form.Item label={t('productCode')} name="productCode" rules={[{ required: true, message: "Vui lòng nhập mã sản phẩm" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('productName')} name="productName" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('category')} name="category">
              <Select>
                {categories
                  .filter(category => category.isParent)
                  .map(category => (
                    <Option key={category._id} value={category._id}>
                      {category.categoryName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('brand')} name="brand" rules={[{ required: true, message: "Bạn chưa chọn nhãn hiệu" }]}>
              <Select>
                {categories
                  .filter(category => !category.isParent)
                  .map(category => (
                    <Option key={category._id} value={category._id}>
                      {category.categoryName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12]}>
          <Col span={6}>
            <Form.Item label={t('price')} name="price" rules={[{ required: true, message: "Bạn chưa nhập đơn giá" }]}>
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}VNĐ`}
                parser={value => value.replace('VNĐ', '')}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('tax')} name="tax">
              <Select>
                {taxs.map(tax => (
                  <Option key={tax._id} value={tax._id}>
                    {tax.taxCode} - {tax.taxValue}%
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('uom')} name="uom">
              <Select>
                {uoms.map(uom => (
                  <Option key={uom._id} value={uom._id}>
                    {uom.uomName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label={t('images')} name="images" rules={[{ required: true, message: "Vui lòng thêm ảnh" }]}>
              <ImageUpload fileList={product?.images} limit={10} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Item
              label="Màu sắc"
              name="color"
              rules={[{ required: true, message: "Vui lòng chọn màu" }]}
            >
              <Radio.Group>{renderOptionColor()}</Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12]}>
          <Col span={12}>
            <Form.Item label={t('description')} name="description">
              <TextArea rows={15} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('specifications')} name="specifications">
              <TextArea rows={15} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12]}>
          <Col span={6}>
            <Form.Item label={t('active')} name="active" valuePropName="checked">
              <Switch defaultChecked={true} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductFormPage;
