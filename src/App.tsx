import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Check, 
  Download, 
  Share2, 
  User, 
  Clapperboard, 
  Home, 
  Loader2,
  ChevronRight,
  Shield,
  Menu,
  X,
  Clock,
  Target,
  Zap,
  Flame,
  Droplets,
  Binoculars,
  Scan,
  Maximize,
  ChevronDown,
  QrCode,
  MessageCircle,
  Link2,
  Info,
  Moon,
  Wind
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const compressImage = async (base64Str: string, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const App = () => {
  // State Navigasi & UI
  const [currentStep, setCurrentStep] = useState('landing'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveFeedOpen, setLiveFeedOpen] = useState(true); 
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [user, setUser] = useState(null);
  const [activeShareTab, setActiveShareTab] = useState('options'); 
  
  // State Media
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Ref Kamera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State Opsi AI
  const [selectedMode, setSelectedMode] = useState<string | null>(null); 
  const [selectedSubOption, setSelectedSubOption] = useState<string | null>(null);
  const [loadingShared, setLoadingShared] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const photoId = urlParams.get('photoId');
    
    if (photoId) {
      const loadSharedPhoto = async () => {
        try {
          const docRef = doc(db, 'shared_photos', photoId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProcessedImage(docSnap.data().imageData);
            setCurrentStep('result');
          } else {
            console.error("No such shared photo!");
            setCurrentStep('landing');
          }
        } catch (e) {
          console.error("Error fetching photo", e);
          setCurrentStep('landing');
        } finally {
          setLoadingShared(false);
        }
      };
      loadSharedPhoto();
    } else {
      setLoadingShared(false);
    }
  }, []);

  // Opsi Formal
  const FORMAL_OPTIONS = [
    { 
      id: 'tni_ad', 
      label: 'TNI ANGKATAN DARAT (AD)', 
      assetId: 'AD-01',
      description: 'Seragam PDL Malvinas NKRI dengan pola pixel digital hijau-cokelat taktis. Dilengkapi label instansi TNI AD pada dada kiri dengan bet warna natural.',
      prompt: "Indonesian Army (TNI AD) field uniform with green and brown digital pixel camouflage. REMOVE ALL PERSONAL NAMES. The name tag on the right chest must be BLANK. The left chest MUST have the 'TNI AD' label patch in natural subdued colors. DILARANG ADA NAMA ORANG. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI. DILARANG MENGUBAH BACKGROUND."
    },
    { 
      id: 'tni_al', 
      label: 'TNI ANGKATAN LAUT (AL)', 
      assetId: 'AL-04',
      description: 'Seragam PDL Loreng Teluk dengan pola gelombang digital abu-abu gelap khas Korps Marinir. Dilengkapi label instansi TNI AL pada dada kiri.',
      prompt: "Indonesian Navy (TNI AL) field uniform with grey and dark blue digital camouflage. REMOVE ALL PERSONAL NAMES. The name tag on the right chest must be BLANK. The left chest MUST have the 'TNI AL' label patch. DILARANG ADA NAMA ORANG PADA SERAGAM. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI. DILARANG MENGUBAH BACKGROUND."
    },
    { 
      id: 'tni_au', 
      label: 'TNI ANGKATAN UDARA (AU)', 
      assetId: 'AU-07',
      description: 'Seragam PDL Swa Bhuwana Paksa dengan pola digital biru langit dirgantara yang elegan. Dilengkapi label instansi TNI AU pada dada kiri.',
      prompt: "Indonesian Air Force (TNI AU) field uniform with sky blue and navy digital camouflage. REMOVE ALL PERSONAL NAMES. The name tag on the right chest must be BLANK. The left chest MUST have the 'TNI AU' label patch. DILARANG ADA NAMA ORANG PADA SERAGAM. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI. DILARANG MENGUBAH BACKGROUND."
    },
  ];

  // Opsi Cinematic
  const CINEMATIC_OPTIONS = [
    { 
      id: 'jungle_survival', 
      label: 'JUNGLE SURVIVAL ACTION', 
      description: 'Efek ledakan helikopter dramatis di tengah hutan tropis lebat dengan pencahayaan api yang intens dan detail keringat subjek.',
      imageSrc: 'image_c9b9dc.jpg',
      icon: <Flame size={20} />,
      prompt: "Cinematic 8k movie still of a hero with uploaded face strictly used as reference. Environment: Dense, humid tropical jungle at dusk. Background: A massive, fiery explosion of a crashed military helicopter with realistic fire and thick black smoke. Lighting: Dramatic warm orange rim lighting from the explosion contrasting with cool forest shadows. Subject is wearing a mud-splattered tactical rig, sweat and grime on skin. Hyper-realistic fabric textures, anamorphic lens flares, shallow depth of field, gritty blockbuster color grading. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    { 
      id: 'special_forces', 
      label: 'SPECIAL FORCES ELITE', 
      description: 'Visual pasukan khusus di medan perang penuh kabut asap, mengenakan gear taktis lengkap dengan detail pencahayaan high-contrast.',
      imageSrc: 'image_c9ba3f.jpg',
      icon: <Shield size={20} />,
      prompt: "Hyper-realistic portrait of an elite special forces operator, using the uploaded face 100% as reference. Subject is standing in a misty, smoke-filled battlefield ruins. Tactical gear: Ballistic helmet, modern night-vision goggles (NVG), tactical vest with detailed MOLLE webbing, and reinforced gloves. Lighting: Volumetric side lighting cutting through grey smoke, high contrast, muted desaturated military colors. Sharp focus on eyes and facial skin texture. Shot on 35mm lens, movie still quality. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    { 
      id: 'industrial_stealth', 
      label: 'INDUSTRIAL STEALTH', 
      description: 'Penyusupan senyap sniper di kompleks industri terbengkalai saat fajar, menonjolkan tekstur logam berkarat dan cahaya matahari pagi.',
      imageSrc: 'image_e1d12f.jpg',
      icon: <Binoculars size={20} />,
      prompt: "8k ultra-detailed cinematic shot of a lone sniper in a derelict industrial warehouse during dawn. Uploaded face is the main hero. Atmosphere: Dust particles floating in golden light shafts (god rays) from broken windows. Textures: Rusty iron pipes, cold concrete floors, weathered tactical camouflage. Lighting: Warm sunrise lighting, soft bokeh background. Subject is holding a suppressed long-range rifle with precision. High dynamic range, realistic shadows, sharp metallic details. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    { 
      id: 'rainy_raid', 
      label: 'RAINY FACTORY RAID', 
      description: 'Penyergapan di pabrik tua saat hujan badai intens, dengan detail butiran air yang tajam dan pantulan cahaya pada permukaan basah.',
      imageSrc: 'image_e22f48.jpg',
      icon: <Droplets size={20} />,
      prompt: "Cinematic action frame in torrential rain, featuring the subjek from uploaded face. Environment: Wet, dark industrial steel grating. Lighting: Harsh blue and amber industrial lights reflecting off rain-soaked surfaces. Detail: Sharp water droplets falling on subject's waterproof tactical gear and skin. Intense, moody, and immersive atmosphere. Deep shadows, high saturation in lights, cinematic teal and orange grading. Extreme detail on fabric and water physics. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    {
      id: 'desert_canyon_sniper',
      label: 'DESERT CANYON SNIPER',
      description: 'Misi pengintaian jarak jauh di tepi tebing gurun yang gersang, menampilkan detail kamuflase desert-tan dan atmosfer peperangan gurun yang intens.',
      imageSrc: 'image_943d1c.jpg',
      icon: <Target size={20} />,
      prompt: "A hyper detailed cinematic scene close-up shot featuring use uploaded face 100% as reference as the main hero. The hero is prone on a sun-baked, rocky canyon cliff edge. Wearing faded desert camouflage and a tactical shemagh wrapped loosely around the neck, with visible sweat stains and grains of red sand clinging to the coarse fabric. The hero is looking down the optic of a heavily modified sniper rifle wrapped in tan burlap. The rifle's bipod is firmly dug into the cracked earth. The lighting is harsh, blistering midday sunlight casting deep, sharp shadows, with visible heat distortion waves radiating from the hot metal barrel, creating a tense, unforgiving desert warfare atmosphere. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    {
      id: 'industrial_extraction_escape',
      label: 'INDUSTRIAL EXTRACTION ESCAPE',
      description: 'Misi pelarian intens di atap industri saat hujan badai, menampilkan aksi dinamis sniper yang menghindari kejaran dengan efek motion blur.',
      imageSrc: 'image_944ba0.jpg',
      icon: <Zap size={20} />,
      prompt: "A hyper-realistic, 8k, highly detailed image, framed as an intense moment in an action film. The character, with uploaded face strictly as reference, is a sniper running across a muddy, debris-strewn industrial rooftop during a heavy downpour. This is a dynamic, slightly low-angle tracking shot, creating a sense of motion blur in the background. The sniper is holding their long-range rifle securely across their chest, clad in dark green tactical gear that is soaked and covered in mud. The character is looking back over their shoulder with an intense, urgent expression, as if evading pursuit. Cinematic lighting comes from bright, distant industrial floodlights cutting through the driving rain, highlighting water splashing off the character's gear. The background is a blur of rusty structures, wet concrete, and the glow of an extraction helicopter's lights in the distance. The tone is high-octane, desperate, and gritty. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    {
      id: 'urban_neo_noir_stealth',
      label: 'URBAN NEO-NOIR STEALTH',
      description: 'Operasi agen rahasia di gang perkotaan malam yang basah, menyelinap di bawah cahaya bulan sejuk dan pantulan lampu neon magenta.',
      imageSrc: 'image_94b844.jpg',
      icon: <Moon size={20} />,
      prompt: "A hyper-realistic, 8k, highly detailed image of a covert operative in a dark, rain-slicked urban alleyway at night, captured with a dramatic slight Dutch angle, medium-close shot using a 50mm lens. The character, with uploaded face as reference, is pressed tightly against a heavily textured brick wall in the left foreground, holding a suppressed tactical pistol at the low-ready position, peering cautiously into the shadows. They are clad in sleek, midnight-black tactical armor and a wet, dark tactical jacket that reflects the ambient moisture. Cinematic lighting dominates the scene, with cool blue moonlight and distant, vibrant magenta neon reflections dancing on the wet puddles and raindrops clinging to the character's gear. The background features blurred, glowing city streetlights, steam rising from grates, and silhouetted fire escapes, rendered with a shallow depth of field and anamorphic bokeh, adding a gritty, tense atmosphere. Highly detailed textures are visible on the wet skin, the worn bricks, and the metallic sheen of the firearm. The overall tone is gritty, suspenseful, and neo-noir, emphasizing urban stealth. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    },
    {
      id: 'jungle_extraction_firefight',
      label: 'JUNGLE EXTRACTION FIREFIGHT',
      description: 'Misi pelarian darurat menembus hutan lebat di tengah baku tembak sengit dengan latar belakang kompleks musuh yang meledak hebat.',
      imageSrc: 'image_94cace.jpg',
      icon: <Wind size={20} />,
      prompt: "A hyper-realistic, 8k, highly detailed cinematic tracking shot, framed as a medium-wide film still, capturing the male operative (consistent face, expression of urgency and determination, covered in dirt and sweat), in a full-throttle run through dense, muddy jungle foliage. He is wearing weathered camouflage gear and is pursued by several armed guards (partially visible in the dynamic, blurred background, obscured by foliage). He is vaulting over a large fallen tree trunk while firing a carbine with a suppressor backwards over his shoulder. In the distant background, a jungle compound is partially engulfed in an explosion, with flames and smoke billowing into the sky. Cinematic lighting, with warm golden hour light filtering through the dense canopy and creating dramatic god rays (light shafts), is contrasted by the orange glow from the distant fire. Highly detailed textures show mud splattered on his face and gear, the wet leaves, and spent shell casings bouncing on the jungle floor. Dynamic movement, shallow depth of field keeps his figure and the fire in sharp focus while the jungle blurs around him. The tone is gritty, explosive, and breathless. KEEP ORIGINAL FACE EXACTLY AS IS. ALWAYS PRESERVE THE AUTHENTIC AND NATURAL FACE OF THE PERSON. DILARANG MERUBAH WAJAH SAMA SEKALI."
    }
  ];

  // Logika Kamera & AI
  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      executeCapture();
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => setCountdown(5);

  const startCamera = async () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setCurrentStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error(err);
      setError("Akses kamera ditolak. Silakan periksa izin peramban.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const executeCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.8)); 
        stopCamera();
        setCurrentStep('preview');
      }
    }
  };

  const processImage = async (optionId: string) => {
    if (!capturedImage) return;
    setCurrentStep('processing');
    setSelectedSubOption(optionId);
    const base64Data = capturedImage.split(',')[1];
    let promptText = "";

    if (selectedMode === 'formal') {
      const option = FORMAL_OPTIONS.find(o => o.id === optionId);
      promptText = option?.prompt || "";
    } else {
      const cinematicObj = CINEMATIC_OPTIONS.find(o => o.id === optionId);
      promptText = cinematicObj?.prompt || "";
    }

    try {
      const callAi = async (retryCount = 0): Promise<void> => {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg',
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          });

          let base64Image = null;
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
               base64Image = part.inlineData.data;
               break;
            }
          }
          
          if (base64Image) {
            setProcessedImage(`data:image/jpeg;base64,${base64Image}`);
            setCurrentStep('result');
          } else { 
            throw new Error('No image in response'); 
          }
        } catch (err: any) {
          console.error("API Error Response:", err);
          if (retryCount < 2) {
            await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
            return callAi(retryCount + 1);
          }
          throw err;
        }
      };
      await callAi();
    } catch (err: any) {
      console.error(err);
      setError("Gagal mensintesis gambar. Sesi neural terputus.");
      setCurrentStep('mode-select');
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `intek_ai_studio_${Date.now()}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (!processedImage) return;
    setIsSharing(true);
    
    try {
      const compressedImage = await compressImage(processedImage, 800, 0.6);
      const newPhotoId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const docRef = doc(db, 'shared_photos', newPhotoId);
      
      await setDoc(docRef, {
        imageData: compressedImage,
        createdAt: Date.now()
      });

      const baseUrl = window.location.href.split('?')[0];
      const link = `${baseUrl}?photoId=${newPhotoId}`;
      
      setShareLink(link);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`);
      setActiveShareTab('options');
      setShowShareModal(true);
    } catch (e) {
      console.error("Error sharing photo: ", e);
      alert("Gagal membagikan foto, coba lagi.");
    } finally {
      setIsSharing(false);
    }
  };

  const shareToWA = () => {
    const text = `Lihat hasil foto AI saya di Intek Studio! ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (window.location.search.includes('photoId')) {
    if (loadingShared) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans selection:bg-[#00ffcc]/30">
           <Loader2 size={40} className="animate-spin text-[#00ffcc] mb-4" />
           <p className="text-white font-bold tracking-widest uppercase">Membuka Foto ...</p>
        </div>
      );
    }
    
    if (!processedImage) {
       return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center font-sans">
           <p className="mb-8 text-white/50 tracking-widest uppercase text-sm">Foto tidak ditemukan atau sudah kadaluarsa.</p>
           <button onClick={() => window.location.href = window.location.href.split('?')[0]} className="py-4 px-10 bg-[#00ffcc] text-black font-black italic rounded-xl hover:bg-white transition-colors">BUAT FOTO SENDIRI</button>
        </div>
       );
    }

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#00ffcc]/30">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <h2 className="text-[#00ffcc] text-2xl sm:text-3xl font-black italic tracking-tighter uppercase mb-8 drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]">INTEK <span className="text-white">STUDIO</span></h2>
          <div className="relative w-full flex items-center justify-center mb-10 overflow-hidden rounded-[32px] border-2 border-[#00ffcc]/20 shadow-[0_0_60px_rgba(0,255,204,0.15)] bg-[#0a0a0a]">
             <img src={processedImage} alt="Intek AI Studio Result" className="max-w-full max-h-[65vh] object-contain" />
          </div>
          <div className="flex w-full">
            <button onClick={() => {
                const link = document.createElement('a');
                link.href = processedImage;
                link.download = `intek_ai_studio_${Date.now()}.jpg`;
                link.click();
            }} className="w-full py-5 bg-[#00ffcc] text-black font-black italic rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-transform shadow-[0_0_30px_rgba(0,255,204,0.3)] uppercase tracking-tighter text-lg">
              <Download size={24} /><span>DOWNLOAD PHOTO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#00ffcc] font-sans selection:bg-[#00ffcc]/30 flex flex-col overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-black/95 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 border-r border-[#00ffcc]/20 p-6 shadow-2xl`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black italic tracking-tighter uppercase">INTEK <span className="text-white">STUDIO</span></h2>
          <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="space-y-1">
          <button onClick={() => { setCurrentStep('landing'); setSidebarOpen(false); }} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${currentStep === 'landing' ? 'bg-[#00ffcc]/10 text-[#00ffcc]' : 'text-white hover:bg-white/5'}`}><Home size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span></button>
          <div className="pt-4">
            <button onClick={() => setLiveFeedOpen(!liveFeedOpen)} className="w-full flex items-center justify-between p-3 text-white/40 hover:text-white transition-colors"><div className="flex items-center space-x-3"><Target size={18} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Feed</span></div><ChevronDown size={14} className={`transition-transform duration-300 ${liveFeedOpen ? 'rotate-180' : ''}`} /></button>
            {liveFeedOpen && (
              <div className="pl-4 mt-1 space-y-1">
                <button onClick={() => { setSelectedMode('formal'); startCamera(); setSidebarOpen(false); }} className="w-full flex items-center space-x-3 p-3 rounded-lg text-white/70 hover:bg-[#00ffcc]/5 hover:text-[#00ffcc] transition-all"><Shield size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Tactical Uniform</span></button>
                <button onClick={() => { setSelectedMode('cinematic'); startCamera(); setSidebarOpen(false); }} className="w-full flex items-center space-x-3 p-3 rounded-lg text-white/70 hover:bg-[#00ffcc]/5 hover:text-[#00ffcc] transition-all"><Clapperboard size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Cinematic AI</span></button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <header className="px-6 py-5 flex justify-between items-center bg-black border-b border-[#00ffcc]/10 z-40 sticky top-0">
        <button onClick={() => setSidebarOpen(true)} className="p-2 border border-[#00ffcc]/20 rounded hover:bg-[#00ffcc]/10 transition-colors"><Menu size={20} /></button>
        <div className="text-center"><div className="text-lg font-black tracking-tighter italic leading-none uppercase">INTEK <span className="text-white">STUDIO</span></div></div>
        <div className="flex items-center space-x-3"><div className={`w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse`}></div><span className="text-[10px] font-bold hidden sm:inline tracking-widest uppercase">System Online</span></div>
      </header>

      <main className="flex-grow flex flex-col relative overflow-hidden">
        {currentStep === 'landing' && (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
             <div className="mb-6 relative"><div className="text-4xl sm:text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] uppercase">INTEK AI STUDIO</div><div className="h-1 w-32 bg-[#00ffcc] mx-auto mt-4 rounded-full shadow-[0_0_10px_#00ffcc]"></div></div>
             <button onClick={() => { setSelectedMode(null); startCamera(); }} className="group relative px-14 py-5 bg-white text-black font-black text-xl rounded-full hover:bg-[#00ffcc] hover:text-black transition-all transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] uppercase tracking-tighter mt-12">Mulai Sekarang</button>
          </div>
        )}

        {currentStep === 'camera' && (
          <div className="flex-grow relative bg-black flex flex-col overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 pointer-events-none flex flex-col">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10"></div>
               <div className="flex-grow flex items-center justify-center"><div className="w-64 h-80 border border-[#00ffcc]/10 rounded-[40%] flex items-center justify-center"><Maximize size={24} className="text-[#00ffcc]/20 animate-pulse" /></div></div>
            </div>
            {countdown !== null && (<div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30"><div className="text-[250px] font-black italic text-[#00ffcc] drop-shadow-[0_0_50px_#00ffcc] animate-ping uppercase leading-none">{countdown}</div></div>)}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent flex justify-center items-center space-x-12 px-8 z-40">
              <button onClick={() => { stopCamera(); setCurrentStep('landing'); }} className="w-14 h-14 bg-black/40 backdrop-blur rounded-full flex items-center justify-center border border-white/20 hover:bg-[#00ffcc]/20 transition-all active:scale-90"><X size={24} className="text-white" /></button>
              <button onClick={startCountdown} disabled={countdown !== null} className={`group relative w-24 h-24 rounded-full p-2 border-4 transition-all ${countdown !== null ? 'border-red-500' : 'border-[#00ffcc]/40 active:scale-95'}`}><div className={`w-full h-full rounded-full flex items-center justify-center transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] ${countdown !== null ? 'bg-red-600' : 'bg-white'}`}>{countdown === null && <Camera size={40} className="text-black" />}</div></button>
              <div className="w-14 flex flex-col items-center opacity-60"><Target size={24} className="mb-1 text-[#00ffcc] animate-pulse" /><span className="text-[8px] font-black uppercase tracking-widest">Live</span></div>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="absolute inset-0 bg-black flex flex-col z-20">
            <div className="flex-grow relative flex items-center justify-center p-4 overflow-hidden">
              {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-contain shadow-2xl rounded-2xl border border-[#00ffcc]/20" />}
            </div>
            <div className="shrink-0 p-4 sm:p-8 bg-black border-t border-[#00ffcc]/10 flex gap-4">
              <button onClick={startCamera} className="flex-1 py-4 sm:py-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-2 font-black uppercase hover:bg-white/10 transition-all tracking-widest text-xs sm:text-sm"><span>Resync</span></button>
              <button onClick={() => { if (selectedMode === 'formal') setCurrentStep('formal-options'); else if (selectedMode === 'cinematic') setCurrentStep('cinematic-options'); else setCurrentStep('mode-select'); }} className="flex-1 py-4 sm:py-5 bg-[#00ffcc] text-black rounded-2xl flex items-center justify-center space-x-2 font-black shadow-[0_0_25px_rgba(0,255,204,0.3)] uppercase tracking-widest text-xs sm:text-sm"><span>Analyze</span></button>
            </div>
          </div>
        )}

        {currentStep === 'mode-select' && (
          <div className="flex-grow p-8 flex flex-col justify-center max-w-2xl mx-auto space-y-6 w-full">
            <div className="mb-4"><h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">SELECT STYLE</h3></div>
            <button onClick={() => { setSelectedMode('formal'); setCurrentStep('formal-options'); }} className="group p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-[#00ffcc]/50 hover:bg-[#00ffcc]/5 transition-all text-left relative overflow-hidden"><Shield className="absolute right-[-40px] top-[-40px] opacity-5 group-hover:opacity-10 transition-opacity" size={200} /><div className="w-14 h-14 bg-[#00ffcc]/20 rounded-2xl flex items-center justify-center mb-6 text-[#00ffcc]"><User size={28} /></div><h4 className="font-black text-2xl text-white italic group-hover:text-[#00ffcc] transition-colors uppercase tracking-tighter">Tactical Uniform</h4></button>
            <button onClick={() => { setSelectedMode('cinematic'); setCurrentStep('cinematic-options'); }} className="group p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-[#00ffcc]/50 hover:bg-[#00ffcc]/5 transition-all text-left relative overflow-hidden"><Clapperboard className="absolute right-[-40px] top-[-40px] opacity-5 group-hover:opacity-10 transition-opacity" size={200} /><div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white"><Clapperboard size={28} /></div><h4 className="font-black text-2xl text-white italic group-hover:text-[#00ffcc] transition-colors uppercase tracking-tighter">Cinematic AI</h4></button>
          </div>
        )}

        {currentStep === 'formal-options' && (
          <div className="flex-grow p-6 flex flex-col overflow-y-auto bg-black">
            <div className="mb-10 text-center"><h3 className="text-4xl font-black italic tracking-tighter text-white uppercase">Tactical Assets</h3><p className="text-[#00ffcc]/60 text-[10px] uppercase font-bold tracking-[0.3em] mt-2">Pilih Unit Pasukan</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-12">
              {FORMAL_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => processImage(opt.id)} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[32px] hover:border-[#00ffcc] hover:bg-[#00ffcc]/5 transition-all flex flex-col p-8 h-auto min-h-[16rem] shadow-[0_0_20px_rgba(0,0,0,0.5)] text-left">
                  <div className="mb-4 bg-[#00ffcc]/10 w-12 h-12 rounded-xl flex items-center justify-center text-[#00ffcc]/40 group-hover:text-[#00ffcc] transition-all"><Shield size={24} /></div>
                  <div className="flex-grow"><h4 className="font-black text-lg italic text-white group-hover:text-[#00ffcc] transition-colors uppercase tracking-tighter leading-tight mb-3">{opt.label}</h4><p className="text-white/40 text-[11px] leading-relaxed group-hover:text-white/60 transition-colors uppercase tracking-tight font-medium">{opt.description}</p></div>
                  <div className="mt-6 flex items-center justify-between opacity-20 group-hover:opacity-100 transition-all"><span className="text-[8px] font-black uppercase tracking-[0.2em]">Deploy Uniform</span><ChevronRight size={20} className="text-[#00ffcc] group-hover:translate-x-1 transition-all" /></div>
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentStep('mode-select')} className="mt-auto mb-12 py-4 text-white/30 hover:text-[#00ffcc] font-black text-[10px] tracking-[0.4em] transition-all uppercase text-center">Return to Operator Menu</button>
          </div>
        )}

        {currentStep === 'cinematic-options' && (
          <div className="flex-grow p-6 flex flex-col overflow-y-auto bg-black">
            <div className="mb-10 text-center"><h3 className="text-4xl font-black italic tracking-tighter text-white uppercase">Cinema Profiles</h3><p className="text-[#00ffcc]/60 text-[10px] uppercase font-bold tracking-[0.3em] mt-2">Pilih Atmosfer Sinematik</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full mb-12">
              {CINEMATIC_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => processImage(opt.id)} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[40px] hover:border-[#00ffcc] hover:bg-[#00ffcc]/5 transition-all flex flex-col p-10 h-auto min-h-[18rem] shadow-[0_0_20px_rgba(0,0,0,0.5)] text-left">
                  <div className="mb-6 bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center text-[#00ffcc]/40 group-hover:text-[#00ffcc] transition-all">{opt.icon}</div>
                  <div className="flex-grow"><h4 className="font-black text-2xl italic text-white group-hover:text-[#00ffcc] transition-colors uppercase leading-tight tracking-tighter mb-4">{opt.label}</h4><p className="text-white/40 text-[12px] leading-relaxed group-hover:text-white/60 transition-colors uppercase tracking-tight font-medium">{opt.description}</p></div>
                  <div className="mt-8 flex items-center justify-between opacity-20 group-hover:opacity-100 transition-all"><div className="flex items-center space-x-2"><Zap size={12} className="text-[#00ffcc]" /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Synthesize Frame</span></div><ChevronRight size={24} className="text-[#00ffcc] group-hover:translate-x-2 transition-all" /></div>
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentStep('mode-select')} className="mt-auto mb-12 py-4 text-white/20 font-black text-[10px] tracking-[0.4em] uppercase hover:text-white transition-colors text-center">Return to Menu</button>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="flex-grow flex flex-col items-center justify-center p-8 bg-black">
            <div className="relative mb-16 scale-150"><div className="w-32 h-32 border-2 border-[#00ffcc]/10 border-t-[#00ffcc] rounded-full animate-[spin_1.5s_linear_infinite]"></div><div className="absolute inset-0 flex items-center justify-center"><Loader2 size={36} className="animate-pulse text-[#00ffcc]" /></div></div>
            <h3 className="text-4xl font-black italic text-white tracking-tighter mb-4 uppercase animate-pulse">Neural Synthesizing...</h3>
            <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]"><div className="h-full bg-[#00ffcc] animate-[loading_8s_linear_infinite] shadow-[0_0_15px_#00ffcc]"></div></div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="flex-grow flex flex-col">
            <div className="flex-grow relative bg-black flex items-center justify-center p-4 sm:p-8"><div className="relative max-h-full max-w-full group overflow-hidden rounded-2xl">{processedImage && <img src={processedImage} alt="Result" className="max-h-full max-w-full object-contain border border-[#00ffcc]/20 shadow-[0_0_60px_rgba(0,255,204,0.1)]" />}</div></div>
            <div className="p-8 bg-black border-t border-[#00ffcc]/10 space-y-4">
              <div className="flex gap-4 max-w-2xl mx-auto w-full">
                <button onClick={handleDownload} className="flex-1 py-5 bg-[#00ffcc] text-black font-black italic rounded-xl flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,204,0.3)] uppercase tracking-tighter"><Download size={22} /><span>DOWNLOAD PHOTO</span></button>
                <button onClick={handleShare} disabled={isSharing} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-[#00ffcc]/20 transition-all text-white active:scale-90">{isSharing ? <Loader2 size={24} className="animate-spin text-[#00ffcc]" /> : <Share2 size={24} />}</button>
              </div>
              <button onClick={() => { 
                setSelectedMode(null); 
                startCamera(); 
                if (window.location.search) {
                  window.history.pushState({}, '', window.location.pathname);
                }
              }} className="w-full py-4 text-white/30 text-[10px] font-black tracking-[0.4em] hover:text-white transition-colors uppercase">
                {window.location.search.includes('photoId') ? 'Buat Foto AI Kamu Sendiri' : 'Initialize New Session'}
              </button>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <div className="bg-[#0a0a0a] border border-[#00ffcc]/30 p-8 rounded-[40px] max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(0,255,204,0.2)]">
                <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={24} /></button>
                {activeShareTab === 'options' ? (
                  <div>
                    <div className="w-16 h-16 bg-[#00ffcc]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00ffcc]/20 text-[#00ffcc]"><Share2 size={32} /></div>
                    <h4 className="text-xl font-black italic text-white mb-2 uppercase tracking-tight">SHARE PHOTO</h4>
                    <p className="text-white/40 text-[10px] mb-8 font-bold uppercase tracking-widest">Pilih metode untuk membagikan foto anda</p>
                    <div className="space-y-4">
                       <button onClick={shareToWA} className="w-full py-5 bg-[#25D366] text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"><MessageCircle size={22} /><span className="uppercase tracking-widest text-xs">Send to WhatsApp</span></button>
                       <button onClick={() => setActiveShareTab('qr')} className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 active:scale-95 transition-all"><QrCode size={22} /><span className="uppercase tracking-widest text-xs">Show QR Code</span></button>
                       <button onClick={() => { navigator.clipboard.writeText(shareLink); const el = document.createElement('textarea'); el.value = shareLink; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }} className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 active:scale-95 transition-all"><Link2 size={22} /><span className="uppercase tracking-widest text-xs">Copy Link</span></button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-[#00ffcc]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00ffcc]/20 text-[#00ffcc]"><QrCode size={32} /></div>
                    <h4 className="text-xl font-black italic text-white mb-2 uppercase tracking-tight">SCAN TO DOWNLOAD</h4>
                    <p className="text-white/40 text-[10px] mb-6 font-bold uppercase tracking-widest">Pindai QR ini untuk mengunduh foto ke ponsel anda</p>
                    <div className="bg-white p-4 rounded-3xl mb-8 shadow-2xl"><img src={qrUrl} alt="QR Code Share" className="w-full h-auto" /></div>
                    <button onClick={() => setActiveShareTab('options')} className="w-full py-4 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors">Back to options</button>
                  </div>
                )}
             </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </main>

      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
          <div className="bg-[#0a0a0a] border border-red-500/30 p-12 rounded-[40px] max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20"><X size={48} className="text-red-500" /></div>
            <h4 className="text-3xl font-black italic text-white mb-3 uppercase tracking-tighter">System Malfunction</h4>
            <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium uppercase tracking-tight">{error}</p>
            <button onClick={() => { setError(null); setCurrentStep('landing'); }} className="w-full py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all uppercase tracking-widest shadow-xl shadow-red-900/20">Reboot Studio</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
        body { background-color: black; color: #00ffcc; cursor: crosshair; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #00ffcc33; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
