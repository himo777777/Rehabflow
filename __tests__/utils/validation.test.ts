import { describe, it, expect } from 'vitest';
import { validators, combineValidators, validateObject, sanitize } from '../../utils/validation';

describe('validators', () => {
  describe('required', () => {
    it('should pass for non-empty string', () => {
      expect(validators.required('test').isValid).toBe(true);
    });

    it('should fail for empty string', () => {
      expect(validators.required('').isValid).toBe(false);
    });

    it('should fail for null', () => {
      expect(validators.required(null).isValid).toBe(false);
    });

    it('should fail for undefined', () => {
      expect(validators.required(undefined).isValid).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should pass when string meets minimum length', () => {
      expect(validators.minLength(3)('abc').isValid).toBe(true);
    });

    it('should fail when string is too short', () => {
      expect(validators.minLength(3)('ab').isValid).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should pass when string is within max length', () => {
      expect(validators.maxLength(5)('abc').isValid).toBe(true);
    });

    it('should fail when string exceeds max length', () => {
      expect(validators.maxLength(2)('abc').isValid).toBe(false);
    });
  });

  describe('email', () => {
    it('should pass for valid email', () => {
      expect(validators.email('test@example.com').isValid).toBe(true);
    });

    it('should fail for invalid email', () => {
      expect(validators.email('invalid').isValid).toBe(false);
      expect(validators.email('test@').isValid).toBe(false);
      expect(validators.email('@example.com').isValid).toBe(false);
    });
  });

  describe('number', () => {
    it('should pass for valid numbers', () => {
      expect(validators.number(42).isValid).toBe(true);
      expect(validators.number(0).isValid).toBe(true);
      expect(validators.number(-5).isValid).toBe(true);
    });

    it('should fail for NaN', () => {
      expect(validators.number(NaN).isValid).toBe(false);
    });

    it('should fail for non-numbers', () => {
      expect(validators.number('42').isValid).toBe(false);
    });
  });

  describe('range', () => {
    it('should pass when value is within range', () => {
      expect(validators.range(0, 10)(5).isValid).toBe(true);
      expect(validators.range(0, 10)(0).isValid).toBe(true);
      expect(validators.range(0, 10)(10).isValid).toBe(true);
    });

    it('should fail when value is outside range', () => {
      expect(validators.range(0, 10)(-1).isValid).toBe(false);
      expect(validators.range(0, 10)(11).isValid).toBe(false);
    });
  });

  describe('age', () => {
    it('should pass for valid ages', () => {
      expect(validators.age(25).isValid).toBe(true);
      expect(validators.age(1).isValid).toBe(true);
      expect(validators.age(120).isValid).toBe(true);
    });

    it('should fail for invalid ages', () => {
      expect(validators.age(0).isValid).toBe(false);
      expect(validators.age(121).isValid).toBe(false);
      expect(validators.age(-5).isValid).toBe(false);
    });
  });

  describe('painLevel', () => {
    it('should pass for valid pain levels (0-10)', () => {
      expect(validators.painLevel(0).isValid).toBe(true);
      expect(validators.painLevel(5).isValid).toBe(true);
      expect(validators.painLevel(10).isValid).toBe(true);
    });

    it('should fail for invalid pain levels', () => {
      expect(validators.painLevel(-1).isValid).toBe(false);
      expect(validators.painLevel(11).isValid).toBe(false);
    });
  });
});

describe('combineValidators', () => {
  it('should pass when all validators pass', () => {
    const validate = combineValidators(
      validators.required,
      validators.minLength(3)
    );
    expect(validate('test').isValid).toBe(true);
  });

  it('should fail when first validator fails', () => {
    const validate = combineValidators(
      validators.required,
      validators.minLength(3)
    );
    expect(validate('').isValid).toBe(false);
  });

  it('should fail when second validator fails', () => {
    const validate = combineValidators(
      validators.required,
      validators.minLength(5)
    );
    expect(validate('abc').isValid).toBe(false);
  });
});

describe('validateObject', () => {
  it('should validate entire object', () => {
    const schema = {
      name: [validators.required, validators.minLength(2)],
      age: [(v: number) => validators.age(v)],
    };

    const validData = { name: 'Test', age: 25 };
    const result = validateObject(validData, schema);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return errors for invalid fields', () => {
    const schema = {
      name: [validators.required],
      age: [(v: number) => validators.age(v)],
    };

    const invalidData = { name: '', age: 150 };
    const result = validateObject(invalidData, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.age).toBeDefined();
  });
});

describe('sanitize', () => {
  describe('html', () => {
    it('should escape HTML characters', () => {
      expect(sanitize.html('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape quotes', () => {
      expect(sanitize.html('Test "quotes" and \'apostrophes\'')).toBe(
        'Test &quot;quotes&quot; and &#x27;apostrophes&#x27;'
      );
    });
  });

  describe('text', () => {
    it('should trim whitespace', () => {
      expect(sanitize.text('  hello  ')).toBe('hello');
    });

    it('should normalize multiple spaces', () => {
      expect(sanitize.text('hello   world')).toBe('hello world');
    });
  });

  describe('number', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitize.number('123abc456')).toBe('123456');
    });

    it('should keep decimal point', () => {
      expect(sanitize.number('12.34')).toBe('12.34');
    });

    it('should keep negative sign', () => {
      expect(sanitize.number('-123')).toBe('-123');
    });
  });
});
