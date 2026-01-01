import { describe, it, expect } from 'vitest';
import {
  validateFilename,
  splitFilename,
  applyRule,
  applyRules,
  detectConflicts,
  generatePreview,
  createEmptyRule,
  getRuleTypeName,
  getCaseModeName,
  type RenameRule,
  type RenamePreview,
} from '../rename-engine';

describe('validateFilename', () => {
  describe('empty filename', () => {
    it('should reject empty string', () => {
      const result = validateFilename('');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('empty');
    });

    it('should reject whitespace only', () => {
      const result = validateFilename('   ');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('empty');
    });
  });

  describe('illegal characters', () => {
    it('should reject backslash', () => {
      const result = validateFilename('test\\file.txt');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('illegal');
    });

    it('should reject forward slash', () => {
      const result = validateFilename('test/file.txt');
      expect(result.valid).toBe(false);
    });

    it('should reject colon', () => {
      const result = validateFilename('test:file.txt');
      expect(result.valid).toBe(false);
    });

    it('should reject asterisk', () => {
      const result = validateFilename('test*file.txt');
      expect(result.valid).toBe(false);
    });

    it('should reject question mark', () => {
      const result = validateFilename('test?file.txt');
      expect(result.valid).toBe(false);
    });

    it('should reject double quote', () => {
      const result = validateFilename('test"file.txt');
      expect(result.valid).toBe(false);
    });

    it('should reject angle brackets', () => {
      expect(validateFilename('test<file.txt').valid).toBe(false);
      expect(validateFilename('test>file.txt').valid).toBe(false);
    });

    it('should reject pipe', () => {
      const result = validateFilename('test|file.txt');
      expect(result.valid).toBe(false);
    });
  });

  describe('filename length', () => {
    it('should accept 255 character filename', () => {
      const longName = 'a'.repeat(255);
      const result = validateFilename(longName);
      expect(result.valid).toBe(true);
    });

    it('should reject 256 character filename', () => {
      const tooLongName = 'a'.repeat(256);
      const result = validateFilename(tooLongName);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('255');
    });
  });

  describe('Windows reserved names', () => {
    it('should reject CON', () => {
      expect(validateFilename('CON').valid).toBe(false);
      expect(validateFilename('con').valid).toBe(false);
      expect(validateFilename('CON.txt').valid).toBe(false);
    });

    it('should reject PRN', () => {
      expect(validateFilename('PRN').valid).toBe(false);
    });

    it('should reject AUX', () => {
      expect(validateFilename('AUX').valid).toBe(false);
    });

    it('should reject NUL', () => {
      expect(validateFilename('NUL').valid).toBe(false);
    });

    it('should reject COM1-9', () => {
      expect(validateFilename('COM1').valid).toBe(false);
      expect(validateFilename('COM9').valid).toBe(false);
    });

    it('should reject LPT1-9', () => {
      expect(validateFilename('LPT1').valid).toBe(false);
      expect(validateFilename('LPT9').valid).toBe(false);
    });
  });

  describe('trailing characters', () => {
    it('should reject trailing space', () => {
      const result = validateFilename('test.txt ');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('space');
    });

    it('should reject trailing period', () => {
      const result = validateFilename('test.');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('period');
    });
  });

  describe('valid filenames', () => {
    it('should accept normal filename', () => {
      expect(validateFilename('document.txt').valid).toBe(true);
    });

    it('should accept filename with spaces', () => {
      expect(validateFilename('my document.txt').valid).toBe(true);
    });

    it('should accept filename with unicode', () => {
      expect(validateFilename('文件.txt').valid).toBe(true);
    });

    it('should accept filename with dash and underscore', () => {
      expect(validateFilename('my-file_name.txt').valid).toBe(true);
    });
  });
});

describe('splitFilename', () => {
  it('should split filename and extension', () => {
    expect(splitFilename('document.txt')).toEqual({ name: 'document', ext: '.txt' });
  });

  it('should handle multiple dots', () => {
    expect(splitFilename('file.name.tar.gz')).toEqual({ name: 'file.name.tar', ext: '.gz' });
  });

  it('should handle no extension', () => {
    expect(splitFilename('README')).toEqual({ name: 'README', ext: '' });
  });

  it('should handle dotfile', () => {
    expect(splitFilename('.gitignore')).toEqual({ name: '.gitignore', ext: '' });
  });
});

describe('applyRule - findReplace', () => {
  it('should replace simple string', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: 'old',
      replace: 'new',
      caseSensitive: true,
      useRegex: false,
    };
    expect(applyRule('old_file.txt', rule, 0)).toBe('new_file.txt');
  });

  it('should replace all occurrences', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: 'a',
      replace: 'b',
      caseSensitive: true,
      useRegex: false,
    };
    expect(applyRule('aaa.txt', rule, 0)).toBe('bbb.txt');
  });

  it('should handle case insensitive replacement', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: 'OLD',
      replace: 'new',
      caseSensitive: false,
      useRegex: false,
    };
    expect(applyRule('Old_File.txt', rule, 0)).toBe('new_File.txt');
  });

  it('should handle regex replacement', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: '\\d+',
      replace: 'NUM',
      caseSensitive: true,
      useRegex: true,
    };
    expect(applyRule('file123.txt', rule, 0)).toBe('fileNUM.txt');
  });

  it('should handle regex capture groups', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: '(\\w+)_(\\w+)',
      replace: '$2_$1',
      caseSensitive: true,
      useRegex: true,
    };
    expect(applyRule('first_second.txt', rule, 0)).toBe('second_first.txt');
  });

  it('should handle empty find string', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: '',
      replace: 'prefix',
      caseSensitive: true,
      useRegex: false,
    };
    expect(applyRule('file.txt', rule, 0)).toBe('file.txt');
  });

  it('should handle invalid regex gracefully', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: '[invalid',
      replace: 'test',
      caseSensitive: true,
      useRegex: true,
    };
    expect(applyRule('file.txt', rule, 0)).toBe('file.txt');
  });

  it('should not affect extension', () => {
    const rule: RenameRule = {
      type: 'findReplace',
      find: 'txt',
      replace: 'md',
      caseSensitive: true,
      useRegex: false,
    };
    expect(applyRule('filetxt.txt', rule, 0)).toBe('filemd.txt');
  });
});

describe('applyRule - prefix', () => {
  it('should add prefix', () => {
    const rule: RenameRule = { type: 'prefix', value: 'new_' };
    expect(applyRule('file.txt', rule, 0)).toBe('new_file.txt');
  });

  it('should handle empty prefix', () => {
    const rule: RenameRule = { type: 'prefix', value: '' };
    expect(applyRule('file.txt', rule, 0)).toBe('file.txt');
  });

  it('should preserve extension', () => {
    const rule: RenameRule = { type: 'prefix', value: 'prefix_' };
    expect(applyRule('document.pdf', rule, 0)).toBe('prefix_document.pdf');
  });
});

describe('applyRule - suffix', () => {
  it('should add suffix before extension', () => {
    const rule: RenameRule = { type: 'suffix', value: '_backup' };
    expect(applyRule('file.txt', rule, 0)).toBe('file_backup.txt');
  });

  it('should handle empty suffix', () => {
    const rule: RenameRule = { type: 'suffix', value: '' };
    expect(applyRule('file.txt', rule, 0)).toBe('file.txt');
  });

  it('should work with files without extension', () => {
    const rule: RenameRule = { type: 'suffix', value: '_backup' };
    expect(applyRule('README', rule, 0)).toBe('README_backup');
  });
});

describe('applyRule - sequence', () => {
  it('should add sequence as suffix', () => {
    const rule: RenameRule = {
      type: 'sequence',
      start: 1,
      step: 1,
      digits: 2,
      position: 'suffix',
    };
    expect(applyRule('file.txt', rule, 0)).toBe('file01.txt');
    expect(applyRule('file.txt', rule, 1)).toBe('file02.txt');
    expect(applyRule('file.txt', rule, 2)).toBe('file03.txt');
  });

  it('should add sequence as prefix', () => {
    const rule: RenameRule = {
      type: 'sequence',
      start: 1,
      step: 1,
      digits: 3,
      position: 'prefix',
    };
    expect(applyRule('file.txt', rule, 0)).toBe('001file.txt');
    expect(applyRule('file.txt', rule, 9)).toBe('010file.txt');
  });

  it('should replace filename with sequence', () => {
    const rule: RenameRule = {
      type: 'sequence',
      start: 100,
      step: 10,
      digits: 4,
      position: 'replace',
    };
    expect(applyRule('file.txt', rule, 0)).toBe('0100.txt');
    expect(applyRule('file.txt', rule, 1)).toBe('0110.txt');
    expect(applyRule('file.txt', rule, 2)).toBe('0120.txt');
  });

  it('should handle custom step', () => {
    const rule: RenameRule = {
      type: 'sequence',
      start: 0,
      step: 5,
      digits: 2,
      position: 'suffix',
    };
    expect(applyRule('file.txt', rule, 0)).toBe('file00.txt');
    expect(applyRule('file.txt', rule, 1)).toBe('file05.txt');
    expect(applyRule('file.txt', rule, 2)).toBe('file10.txt');
  });

  it('should handle negative start', () => {
    const rule: RenameRule = {
      type: 'sequence',
      start: -5,
      step: 1,
      digits: 2,
      position: 'suffix',
    };
    expect(applyRule('file.txt', rule, 0)).toBe('file-5.txt');
  });
});

describe('applyRule - case', () => {
  it('should convert to uppercase', () => {
    const rule: RenameRule = { type: 'case', mode: 'upper' };
    expect(applyRule('Hello World.txt', rule, 0)).toBe('HELLO WORLD.txt');
  });

  it('should convert to lowercase', () => {
    const rule: RenameRule = { type: 'case', mode: 'lower' };
    expect(applyRule('Hello World.TXT', rule, 0)).toBe('hello world.TXT');
  });

  it('should convert to title case', () => {
    const rule: RenameRule = { type: 'case', mode: 'title' };
    expect(applyRule('hello world.txt', rule, 0)).toBe('Hello World.txt');
  });

  it('should convert to sentence case', () => {
    const rule: RenameRule = { type: 'case', mode: 'sentence' };
    expect(applyRule('HELLO WORLD.txt', rule, 0)).toBe('Hello world.txt');
  });

  it('should preserve extension', () => {
    const rule: RenameRule = { type: 'case', mode: 'upper' };
    expect(applyRule('file.TXT', rule, 0)).toBe('FILE.TXT');
  });
});

describe('applyRule - removeChars', () => {
  it('should remove specified characters', () => {
    const rule: RenameRule = { type: 'removeChars', chars: ' ' };
    expect(applyRule('hello world.txt', rule, 0)).toBe('helloworld.txt');
  });

  it('should remove multiple different characters', () => {
    const rule: RenameRule = { type: 'removeChars', chars: '- _' };
    expect(applyRule('hello-world_test file.txt', rule, 0)).toBe('helloworldtestfile.txt');
  });

  it('should handle empty chars', () => {
    const rule: RenameRule = { type: 'removeChars', chars: '' };
    expect(applyRule('file.txt', rule, 0)).toBe('file.txt');
  });

  it('should not affect extension', () => {
    const rule: RenameRule = { type: 'removeChars', chars: 'x' };
    expect(applyRule('textfile.txt', rule, 0)).toBe('tetfile.txt');
  });
});

describe('applyRules', () => {
  it('should apply multiple rules in sequence', () => {
    const rules: RenameRule[] = [
      { type: 'case', mode: 'lower' },
      { type: 'prefix', value: 'new_' },
      { type: 'suffix', value: '_backup' },
    ];
    expect(applyRules('MyFile.txt', rules, 0)).toBe('new_myfile_backup.txt');
  });

  it('should handle empty rules array', () => {
    expect(applyRules('file.txt', [], 0)).toBe('file.txt');
  });
});

describe('detectConflicts', () => {
  it('should detect duplicate new names', () => {
    const previews: RenamePreview[] = [
      { originalName: 'file1.txt', newName: 'output.txt', hasConflict: false, hasError: false },
      { originalName: 'file2.txt', newName: 'output.txt', hasConflict: false, hasError: false },
    ];
    const result = detectConflicts(previews);
    expect(result[0].hasConflict).toBe(true);
    expect(result[1].hasConflict).toBe(true);
  });

  it('should be case insensitive for conflict detection', () => {
    const previews: RenamePreview[] = [
      { originalName: 'file1.txt', newName: 'Output.txt', hasConflict: false, hasError: false },
      { originalName: 'file2.txt', newName: 'output.txt', hasConflict: false, hasError: false },
    ];
    const result = detectConflicts(previews);
    expect(result[0].hasConflict).toBe(true);
    expect(result[1].hasConflict).toBe(true);
  });

  it('should not mark unique names as conflicts', () => {
    const previews: RenamePreview[] = [
      { originalName: 'file1.txt', newName: 'output1.txt', hasConflict: false, hasError: false },
      { originalName: 'file2.txt', newName: 'output2.txt', hasConflict: false, hasError: false },
    ];
    const result = detectConflicts(previews);
    expect(result[0].hasConflict).toBe(false);
    expect(result[1].hasConflict).toBe(false);
  });

  it('should skip error items in conflict detection', () => {
    const previews: RenamePreview[] = [
      {
        originalName: 'file1.txt',
        newName: '',
        hasConflict: false,
        hasError: true,
        errorMessage: 'Empty',
      },
      { originalName: 'file2.txt', newName: 'output.txt', hasConflict: false, hasError: false },
    ];
    const result = detectConflicts(previews);
    expect(result[0].hasError).toBe(true);
    expect(result[1].hasConflict).toBe(false);
  });

  it('should detect conflict with original filename of another file', () => {
    const previews: RenamePreview[] = [
      { originalName: 'file1.txt', newName: 'file2.txt', hasConflict: false, hasError: false },
      { originalName: 'file2.txt', newName: 'file3.txt', hasConflict: false, hasError: false },
    ];
    const result = detectConflicts(previews);
    expect(result[0].hasConflict).toBe(true);
  });
});

describe('generatePreview', () => {
  it('should generate previews for all files', () => {
    const files = ['file1.txt', 'file2.txt', 'file3.txt'];
    const rules: RenameRule[] = [{ type: 'prefix', value: 'new_' }];
    const result = generatePreview(files, rules);

    expect(result).toHaveLength(3);
    expect(result[0].originalName).toBe('file1.txt');
    expect(result[0].newName).toBe('new_file1.txt');
    expect(result[1].newName).toBe('new_file2.txt');
    expect(result[2].newName).toBe('new_file3.txt');
  });

  it('should detect validation errors', () => {
    const files = ['file.txt'];
    const rules: RenameRule[] = [
      { type: 'findReplace', find: 'file', replace: 'CON', caseSensitive: true, useRegex: false },
    ];
    const result = generatePreview(files, rules);

    expect(result[0].hasError).toBe(true);
    expect(result[0].errorMessage).toContain('reserved');
  });

  it('should detect conflicts automatically', () => {
    const files = ['file1.txt', 'file2.txt'];
    const rules: RenameRule[] = [
      { type: 'findReplace', find: '\\d', replace: '', caseSensitive: true, useRegex: true },
    ];
    const result = generatePreview(files, rules);

    expect(result[0].newName).toBe('file.txt');
    expect(result[1].newName).toBe('file.txt');
    expect(result[0].hasConflict).toBe(true);
    expect(result[1].hasConflict).toBe(true);
  });

  it('should handle empty rules', () => {
    const files = ['file.txt'];
    const result = generatePreview(files, []);

    expect(result[0].originalName).toBe('file.txt');
    expect(result[0].newName).toBe('file.txt');
    expect(result[0].hasConflict).toBe(false);
  });

  it('should apply sequence rules with correct indices', () => {
    const files = ['a.txt', 'b.txt', 'c.txt'];
    const rules: RenameRule[] = [
      { type: 'sequence', start: 1, step: 1, digits: 2, position: 'replace' },
    ];
    const result = generatePreview(files, rules);

    expect(result[0].newName).toBe('01.txt');
    expect(result[1].newName).toBe('02.txt');
    expect(result[2].newName).toBe('03.txt');
  });
});

describe('createEmptyRule', () => {
  it('should create findReplace rule', () => {
    const rule = createEmptyRule('findReplace');
    expect(rule.type).toBe('findReplace');
    if (rule.type === 'findReplace') {
      expect(rule.find).toBe('');
      expect(rule.replace).toBe('');
      expect(rule.caseSensitive).toBe(false);
      expect(rule.useRegex).toBe(false);
    }
  });

  it('should create prefix rule', () => {
    const rule = createEmptyRule('prefix');
    expect(rule.type).toBe('prefix');
    if (rule.type === 'prefix') {
      expect(rule.value).toBe('');
    }
  });

  it('should create suffix rule', () => {
    const rule = createEmptyRule('suffix');
    expect(rule.type).toBe('suffix');
    if (rule.type === 'suffix') {
      expect(rule.value).toBe('');
    }
  });

  it('should create sequence rule', () => {
    const rule = createEmptyRule('sequence');
    expect(rule.type).toBe('sequence');
    if (rule.type === 'sequence') {
      expect(rule.start).toBe(1);
      expect(rule.step).toBe(1);
      expect(rule.digits).toBe(2);
      expect(rule.position).toBe('suffix');
    }
  });

  it('should create case rule', () => {
    const rule = createEmptyRule('case');
    expect(rule.type).toBe('case');
    if (rule.type === 'case') {
      expect(rule.mode).toBe('lower');
    }
  });

  it('should create removeChars rule', () => {
    const rule = createEmptyRule('removeChars');
    expect(rule.type).toBe('removeChars');
    if (rule.type === 'removeChars') {
      expect(rule.chars).toBe('');
    }
  });
});

describe('getRuleTypeName', () => {
  it('should return correct names', () => {
    expect(getRuleTypeName('findReplace')).toBe('Find & Replace');
    expect(getRuleTypeName('prefix')).toBe('Add Prefix');
    expect(getRuleTypeName('suffix')).toBe('Add Suffix');
    expect(getRuleTypeName('sequence')).toBe('Sequence Number');
    expect(getRuleTypeName('case')).toBe('Change Case');
    expect(getRuleTypeName('removeChars')).toBe('Remove Characters');
  });
});

describe('getCaseModeName', () => {
  it('should return correct mode names', () => {
    expect(getCaseModeName('upper')).toBe('UPPERCASE');
    expect(getCaseModeName('lower')).toBe('lowercase');
    expect(getCaseModeName('title')).toBe('Title Case');
    expect(getCaseModeName('sentence')).toBe('Sentence case');
  });
});
