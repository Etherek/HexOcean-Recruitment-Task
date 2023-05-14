import { useState } from 'react';
import '../styles/Form.css'
import { Form, Input, Select, InputNumber, Button } from 'antd';

const { Option } = Select;

type DishType = 'pizza' | 'soup' | 'sandwich';

interface FormData {
  name: string;
  preparation_time: string;
  type: DishType;
  no_of_slices?: number;
  diameter?: number;
  spiciness_scale?: number;
  slices_of_bread?: number;
}

const dishTypes = [
  { label: 'Pizza', value: 'pizza' },
  { label: 'Soup', value: 'soup' },
  { label: 'Sandwich', value: 'sandwich' },
];

const DishesForm = () => {
  const [form] = Form.useForm<FormData>();
  const [dishType, setDishType] = useState<DishType>();
  const [firstWordEntered, setFirstWordEntered] = useState<boolean>(false);
  const [preparationTimeValid, setPreparationTimeValid] = useState<boolean>(false);
  const [dishTypeSelected, setDishTypeSelected] = useState<boolean>(false);
  const [isNumberOfSlices, setIsNumberOfSlices] = useState<boolean>(false);
  const [isDiameter, setIsDiameter] = useState<boolean>(false);
  const [isSpicinessScale, setIsSpicinessScale] = useState<boolean>(false);
  const [isNumberOfBreadSlices, setIsNumberOfBreadSlices] = useState<boolean>(false);
  const [isValidTimeRange,setIsValidTimeRange] = useState<boolean>(true)
  const [isError, setIsError] =useState<boolean>(false)
  const [error, setError] = useState<string>();
  const [code, setCode] = useState<string>();
  const [isFetchSuccess, setIsFetchSuccess] = useState<boolean>(false);

  const handleDishTypeChange = (value: DishType) => {
    setDishTypeSelected(true);
    setDishType(value);
  };

  const otherInputsChange = () => {
    if (dishType === 'pizza') {
      setIsNumberOfSlices(true)
      setIsDiameter(true);
    } if (dishType === 'sandwich') {
      setIsNumberOfBreadSlices(true)
    } if (dishType === 'soup') {
      setIsSpicinessScale(true)
    }
  }
  const handleFormSubmit = () => {
    setIsError(false)
    setIsFetchSuccess(false)

    form
      .validateFields()
      .then(values => {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        };
        fetch('https://umzzcc503l.execute-api.us-west-2.amazonaws.com/dishes/', requestOptions)
          .then(response => response.json())
          .then(data =>
            setIsFetchSuccess(true)
            )
          .catch(error => {
            setError(error.message);
            setCode(error.code);
          });
      })
      .catch(errors => {
        
      });
  };

  const formatPreparationTime = (value: string | undefined) => {
    if (!value) {
      return value;
    }
    setPreparationTimeValid(false)
    setIsValidTimeRange(true)
    const trimmedValue: string = value.replace(/[^\d]/g, '');
    const hours: string = trimmedValue.substring(0, 2);
    const minutes: string = trimmedValue.substring(2, 4);
    const seconds: string = trimmedValue.substring(4, 6);
  
    let formattedValue = '';
    if (hours) {
      formattedValue += hours;
    }
    if (minutes) {
      formattedValue += `:${minutes}`;
    }
    if (seconds) {
      formattedValue += `:${seconds}`;
    }

    if (formattedValue.length === 8){
      if (parseInt(hours) < 0 || parseInt(hours) > 23) {
        setIsValidTimeRange(false)
      } if (parseInt(minutes) < 0 || parseInt(minutes) > 60 ){
        setIsValidTimeRange(false)
      } if (parseInt(seconds) < 0 || parseInt(seconds) > 60 ){
        setIsValidTimeRange(false)
      } else {
      setPreparationTimeValid(true)
    }
    }
    return formattedValue;
    
  };
  
  const handlePreparationTimeChange = (value: string) => {
    const formattedValue = formatPreparationTime(value);
    form.setFieldsValue({ preparation_time: formattedValue });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstWordEntered(false)
    if (e.target.value.trim() !== '') {
      setFirstWordEntered(true);
      form.setFieldsValue({ name: e.target.value });
    }
  };

  return (
    <div className='dishesFormContainer'>
    <Form<FormData> form={form}>
      <div className='dishName'>
      <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter the name of the dish' ,whitespace: true}]} validateStatus={firstWordEntered ? 'success' : form.getFieldError('name') ? 'error' : '' } 
  help={form.getFieldError('name')?.[0]}>
        <Input onChange={handleInputChange} />
      </Form.Item>
      </div>
      <div className='preparationTime'>
      <Form.Item label="Preparation Time" name="preparation_time" rules={[{required: true, message: 'Please enter the Preparation time', pattern: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      
    },
  ]}   validateStatus={preparationTimeValid && isValidTimeRange  ? 'success' : 'error'}
  help={isValidTimeRange? form.getFieldError('preparation_time')?.[0] : 'Invalid preparation time. The acceptable range for hours is 0 to 23, and for minutes and seconds it is 0 to 60'}>
        <Input placeholder="hh:mm:ss" onChange={(e) => handlePreparationTimeChange(e.target.value)} />
      </Form.Item>
      </div>
      <div className='choosingDishType'>
      <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Choose dish type' }]} validateStatus={dishTypeSelected ? 'success' : form.getFieldError('type') ? 'error' : ''}
        help={form.getFieldError('type')?.[0]}>
        <Select onChange={handleDishTypeChange}>
          {dishTypes.map(({ label, value }) => (
            <Option key={value} value={value as DishType}>
              {label}
            </Option>
          ))}
        </Select>
        </Form.Item>
        </div>
        
      {dishType === 'pizza' && (
        <div className='pizzaValues'>
          <Form.Item label="Number of slices" name="no_of_slices" rules={[{ required: true, message: 'Please enter the number of slices' }]} validateStatus={isNumberOfSlices ? 'success' : form.getFieldError('no_of_slices') ? 'error' : ''}
  help={form.getFieldError('no_of_slices')?.[0]}>
            <InputNumber min={1} onChange={otherInputsChange}/>
          </Form.Item>
          <Form.Item label="Diameter" name="diameter" rules={[{ required: true, message: 'Please enter the diameter' }]} validateStatus={isDiameter ? 'success' : form.getFieldError('diameter') ? 'error' : ''}
  help={form.getFieldError('diameter')?.[0]}>
            <InputNumber min={0} step={0.1}   onChange={otherInputsChange}/>
          </Form.Item>
        </div>
      )}

      {dishType === 'soup' && (
        <div className='soupValue'>
        <Form.Item label="Spiciness scale" name="spiciness_scale" rules={[{ required: true, message: 'Please enter the Spiciness' }]} validateStatus={isSpicinessScale ? 'success' : form.getFieldError('spiciness_scale') ? 'error' : ''}
        help={form.getFieldError('spiciness_scale')?.[0]}>
          <InputNumber min={1} max={10}  onChange={otherInputsChange} />
        </Form.Item>
        </div>
      )}

      {dishType === 'sandwich' && (
        <div className='sandwichValue'>
        <Form.Item  label="Number of slices of bread" name="slices_of_bread" rules={[{ required: true, message: 'Please enter the number of slices' }]} validateStatus={isNumberOfBreadSlices ? 'success' : form.getFieldError('slices_of_bread') ? 'error' : ''}
        help={form.getFieldError('slices_of_bread')?.[0]}>
          <div className='sandwichValueInput'>
          <InputNumber min={1}  onChange={otherInputsChange}/>
          </div>
        </Form.Item>
        </div>
      )}
      <div className='buttonContainer'>
      <Form.Item>
        <Button type="primary" onClick={handleFormSubmit}>
          Submit
        </Button>
      </Form.Item>
      </div>
      {isFetchSuccess && (
        <div className='successContainer'>
          <p>Success!</p>
        </div>
      )}

      {isError && (
        <div className='errorContainer'>
          <p>Code: {code}</p>
          <p>Error: {error}</p>
        </div>
      )}

    </Form>

    </div>
  );
  
};

export default DishesForm;