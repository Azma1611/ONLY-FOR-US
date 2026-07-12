import { useRef, useEffect } from 'react';

/**
 * Reusable, premium 6-box numeric OTP entry component.
 * Integrates auto-focus, auto-advance, backspace regression, and paste functionality.
 */
export default function OtpInput({ value = '', onChange }) {
  const inputRefs = useRef([]);

  // Split value into array of 6 characters
  const otpArray = value.split('').concat(Array(6).fill('')).slice(0, 6);

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    
    // Only accept numeric inputs
    if (val && !/^[0-9]$/.test(val)) return;

    const newOtpArray = [...otpArray];
    newOtpArray[index] = val;
    const newOtpValue = newOtpArray.join('');
    
    onChange(newOtpValue);

    // Auto-advance focus on entry
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Check if Backspace is pressed
    if (e.key === 'Backspace') {
      const newOtpArray = [...otpArray];
      
      if (otpArray[index]) {
        // If current field has a value, clear it
        newOtpArray[index] = '';
        onChange(newOtpArray.join(''));
      } else if (index > 0) {
        // If current field is empty, move focus back and clear that field
        newOtpArray[index - 1] = '';
        onChange(newOtpArray.join(''));
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Validate that pasted data is numeric and up to 6 digits
    if (!/^[0-9]{1,6}$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtpArray = [...otpArray];
    
    digits.forEach((digit, i) => {
      newOtpArray[i] = digit;
    });

    const newOtpValue = newOtpArray.join('');
    onChange(newOtpValue);

    // Focus the appropriate field (either the next empty field, or the last field if full)
    const targetIndex = Math.min(digits.length, 5);
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
    }
  };

  return (
    <div className="flex justify-between items-center gap-2 sm:gap-3 max-w-sm mx-auto my-6" onPaste={handlePaste}>
      {Array(6).fill(null).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otpArray[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="glass-input w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-bold tracking-normal rounded-xl focus:border-[var(--color-primary)] transition-all duration-150"
          aria-label={`Digit ${index + 1} of verification code`}
        />
      ))}
    </div>
  );
}
