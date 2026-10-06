// Simple calculator logic with keyboard support and basic validation
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
let expression = '';

function updateDisplay() {
  display.value = expression || '0';
}

function appendValue(val) {
  // Prevent multiple leading zeros like "00"
  if (expression === '0' && val === '0') return;
  // If display shows 0 and user adds a digit, replace it
  if (expression === '0' && /[0-9]/.test(val)) {
    expression = val;
    updateDisplay();
    return;
  }
  expression += val;
  updateDisplay();
}

function clearAll() {
  expression = '';
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function sanitizeForEval(expr) {
  // Replace visual operators (none present right now) and fix percent numbers
  // Replace occurrences like 50% with (50/100)
  const replacedPercent = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  // Allow only digits, basic operators, parentheses, dot, percent and spaces
  if (!/^[0-9+\-*/().%\s]*$/.test(replacedPercent)) {
    throw new Error('Invalid characters in expression');
  }
  // Quick safety: avoid sequences like ** or // or ++ (allow unary -)
  // But allow parentheses and normal sequences; let JS handle syntax errors
  return replacedPercent;
}

function calculate() {
  try {
    if (!expression) return;
    const sanitized = sanitizeForEval(expression);
    // Replace any accidental double-operator issues like "--" -> "+" to help readability
    const prepped = sanitized.replace(/--/g, '+');
    // Evaluate using Function constructor (safer than raw eval in some contexts)
    const result = Function(`"use strict"; return (${prepped});`)();
    // Handle Infinity / NaN
    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      display.value = 'Error';
      expression = '';
      return;
    }
    // Trim long floats
    expression = String(Number.isFinite(result) ? +parseFloat(result.toFixed(12)) : result);
    updateDisplay();
  } catch (err) {
    display.value = 'Error';
    expression = '';
    console.warn('Calculation error:', err);
  }
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');
    if (action === 'clear') {
      clearAll();
      return;
    }
    if (action === 'delete') {
      deleteLast();
      return;
    }
    if (action === 'equals') {
      calculate();
      return;
    }
    if (val) {
      // Normalize display for divide/multiply keys
      appendValue(val);
    }
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  // Allow numbers, operators, parentheses, dot, percent
  if (/^[0-9+\-*/().%]$/.test(e.key)) {
    appendValue(e.key);
    e.preventDefault();
    return;
  }

  if (e.key === 'Enter') {
    calculate();
    e.preventDefault();
    return;
  }

  if (e.key === 'Backspace') {
    deleteLast();
    e.preventDefault();
    return;
  }

  if (e.key === 'Escape') {
    clearAll();
    e.preventDefault();
    return;
  }

  // Allow using * and / on numpad
});

// Initialize
clearAll();
