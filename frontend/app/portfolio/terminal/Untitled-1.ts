// Matrix-style rain effect with crypto symbols and binary
const DataRain = ({ data }: { data?: any[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);
// CIA mainframe crypto hacker rain - Satoshi's ghost in the machine
    const chars = [
      ...(data || []).map((d: any) => d.symbol),
      ...(data || []).map((d: any) => `$${d.value?.toFixed ? d.value.toFixed(0) : d.value}`),
      '0x', '1n', '0x', '1n', '0x', '1n', // Hex prefixes
      'SATOSHI', 'a9b3f7c2', '4e8d91ba', '7f2c5a18', 'c6e4b9d7',
      '0xdeadbeef', '0xcafebabe', '0x1337c0de', '0xfeedface',
      'b58a4c7e', '9d3f8e12', 'f7a2c4b9', '6e1d9f38', '8c5a7b2e',
      'ff8800cc', '33aa77bb', 'dd22ee99', '1100ff44', '77cc2288',
      'gAAAAABh', 'eJzNWV1v', 'MIIEvgIB', 'LS0tLS1C', 'RUdJTi0t',
      '0', '1', '0', '1', '0', '1', // Binary
      'カ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', // Japanese (Matrix classic)
      '₿', 'Ξ', '◎', '◊', '$', '€', '¥', '£',
      '░', '▒', '▓', '█', '▄', '▀', '■', '□'

          const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF41';
      ctx.font = '14px "Courier New", monospace';
for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Vary brightness for depth effect
        const brightness = Math.random() * 0.7 + 0.3;
        ctx.fillStyle = `rgba(0, 255, 65, ${brightness})`;
        ctx.fillText(text, i * 20, drops[i] * 20);
        
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
