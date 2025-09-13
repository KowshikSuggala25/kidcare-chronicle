import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '@/types';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, currentUser } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Set language from user profile on load
  useEffect(() => {
    if (userProfile?.language) {
      setCurrentLanguage(userProfile.language);
    }
  }, [userProfile]);

  const setLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    
    // Update user profile if logged in and is a parent
    if (currentUser && userProfile?.role === 'parent') {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          language,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  const isRTL = false; // None of the supported languages are RTL

  const value = {
    currentLanguage,
    setLanguage,
    t: (key: string) => translations[currentLanguage]?.[key] || translations.en[key] || key,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translation strings
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.children': 'Children',
    'nav.vaccinations': 'Vaccinations',
    'nav.records': 'Records',
    'nav.education': 'Education',
    'nav.profile': 'Profile',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.view': 'View',
    'common.download': 'Download',
    'common.generate': 'Generate',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    'auth.signInWith': 'Sign in with',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    
    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.language': 'Language',
    'profile.displayName': 'Display Name',
    'profile.email': 'Email',
    'profile.phoneNumber': 'Phone Number',
    'profile.role': 'Role',
    'profile.memberSince': 'Member Since',
    'profile.lastUpdated': 'Last Updated',
    'profile.security': 'Security Settings',
    'profile.changePassword': 'Change Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmNewPassword': 'Confirm New Password',
    
    // Children
    'children.title': 'Children',
    'children.addChild': 'Add Child',
    'children.childName': 'Child Name',
    'children.dateOfBirth': 'Date of Birth',
    'children.gender': 'Gender',
    'children.male': 'Male',
    'children.female': 'Female',
    'children.other': 'Other',
    'children.viewDetails': 'View Details',
    'children.generateQR': 'Generate QR Code',
    'children.downloadReport': 'Download Report',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.upcomingVaccinations': 'Upcoming Vaccinations',
    'dashboard.statistics': 'Statistics',
    
    // Vaccinations
    'vaccinations.title': 'Vaccinations',
    'vaccinations.schedule': 'Vaccination Schedule',
    'vaccinations.history': 'Vaccination History',
    'vaccinations.upcoming': 'Upcoming',
    'vaccinations.completed': 'Completed',
    'vaccinations.overdue': 'Overdue',
    'vaccinations.scheduled': 'Scheduled',
    'vaccinations.missed': 'Missed',
    
    // Languages
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.telugu': 'తెలుగు',
    'language.tamil': 'தமிழ்',
    'language.malayalam': 'മലയാളം',
  },
  
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.children': 'बच्चे',
    'nav.vaccinations': 'टीकाकरण',
    'nav.records': 'रिकॉर्ड',
    'nav.education': 'शिक्षा',
    'nav.profile': 'प्रोफ़ाइल',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.add': 'जोड़ें',
    'common.view': 'देखें',
    'common.download': 'डाउनलोड',
    'common.generate': 'उत्पन्न करें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.close': 'बंद करें',
    'common.submit': 'जमा करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.yes': 'हाँ',
    'common.no': 'नहीं',
    
    // Auth
    'auth.login': 'लॉगिन',
    'auth.signup': 'साइन अप',
    'auth.logout': 'लॉगआउट',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.rememberMe': 'मुझे याद रखें',
    'auth.signInWith': 'इसके साथ साइन इन करें',
    'auth.dontHaveAccount': 'खाता नहीं है?',
    'auth.alreadyHaveAccount': 'पहले से खाता है?',
    
    // Profile
    'profile.title': 'प्रोफ़ाइल',
    'profile.personalInfo': 'व्यक्तिगत जानकारी',
    'profile.language': 'भाषा',
    'profile.displayName': 'प्रदर्शन नाम',
    'profile.email': 'ईमेल',
    'profile.phoneNumber': 'फ़ोन नंबर',
    'profile.role': 'भूमिका',
    'profile.memberSince': 'सदस्य बने',
    'profile.lastUpdated': 'अंतिम अपडेट',
    'profile.security': 'सुरक्षा सेटिंग्स',
    'profile.changePassword': 'पासवर्ड बदलें',
    'profile.currentPassword': 'वर्तमान पासवर्ड',
    'profile.newPassword': 'नया पासवर्ड',
    'profile.confirmNewPassword': 'नए पासवर्ड की पुष्टि करें',
    
    // Children
    'children.title': 'बच्चे',
    'children.addChild': 'बच्चा जोड़ें',
    'children.childName': 'बच्चे का नाम',
    'children.dateOfBirth': 'जन्म तिथि',
    'children.gender': 'लिंग',
    'children.male': 'पुरुष',
    'children.female': 'महिला',
    'children.other': 'अन्य',
    'children.viewDetails': 'विवरण देखें',
    'children.generateQR': 'QR कोड बनाएं',
    'children.downloadReport': 'रिपोर्ट डाउनलोड करें',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत',
    'dashboard.overview': 'अवलोकन',
    'dashboard.recentActivity': 'हाल की गतिविधि',
    'dashboard.upcomingVaccinations': 'आगामी टीकाकरण',
    'dashboard.statistics': 'सांख्यिकी',
    
    // Vaccinations
    'vaccinations.title': 'टीकाकरण',
    'vaccinations.schedule': 'टीकाकरण कार्यक्रम',
    'vaccinations.history': 'टीकाकरण इतिहास',
    'vaccinations.upcoming': 'आगामी',
    'vaccinations.completed': 'पूर्ण',
    'vaccinations.overdue': 'देर से',
    'vaccinations.scheduled': 'निर्धारित',
    'vaccinations.missed': 'छूट गया',
    
    // Languages
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.telugu': 'తెలుగు',
    'language.tamil': 'தமிழ்',
    'language.malayalam': 'മലയാളം',
  },
  
  te: {
    // Navigation
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.children': 'పిల్లలు',
    'nav.vaccinations': 'వ్యాక్సినేషన్లు',
    'nav.records': 'రికార్డులు',
    'nav.education': 'విద్య',
    'nav.profile': 'ప్రొఫైల్',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.save': 'సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.edit': 'సవరించండి',
    'common.delete': 'తొలగించండి',
    'common.add': 'జోడించండి',
    'common.view': 'చూడండి',
    'common.download': 'డౌన్‌లోడ్',
    'common.generate': 'జనరేట్ చేయండి',
    'common.search': 'వెతకండి',
    'common.filter': 'ఫిల్టర్',
    'common.close': 'మూసివేయండి',
    'common.submit': 'సమర్పించండి',
    'common.back': 'వెనుకకు',
    'common.next': 'తదుపరి',
    'common.previous': 'మునుపటి',
    'common.yes': 'అవును',
    'common.no': 'కాదు',
    
    // Auth
    'auth.login': 'లాగిన్',
    'auth.signup': 'సైన్ అప్',
    'auth.logout': 'లాగౌట్',
    'auth.email': 'ఇమెయిల్',
    'auth.password': 'పాస్‌వర్డ్',
    'auth.confirmPassword': 'పాస్‌వర్డ్ నిర్ధారించండి',
    'auth.forgotPassword': 'పాస్‌వర్డ్ మర్చిపోయారా?',
    'auth.rememberMe': 'నన్ను గుర్తుంచుకోండి',
    'auth.signInWith': 'దీనితో సైన్ ఇన్ చేయండి',
    'auth.dontHaveAccount': 'ఖాతా లేదా?',
    'auth.alreadyHaveAccount': 'ఇప్పటికే ఖాతా ఉందా?',
    
    // Profile
    'profile.title': 'ప్రొఫైల్',
    'profile.personalInfo': 'వ్యక్తిగత సమాచారం',
    'profile.language': 'భాష',
    'profile.displayName': 'ప్రదర్శన పేరు',
    'profile.email': 'ఇమెయిల్',
    'profile.phoneNumber': 'ఫోన్ నంబర్',
    'profile.role': 'పాత్ర',
    'profile.memberSince': 'సభ్యుడైన తేదీ',
    'profile.lastUpdated': 'చివరిసారి నవీకరించబడింది',
    'profile.security': 'భద్రతా సెట్టింగులు',
    'profile.changePassword': 'పాస్‌వర్డ్ మార్చండి',
    'profile.currentPassword': 'ప్రస్తుత పాస్‌వర్డ్',
    'profile.newPassword': 'కొత్త పాస్‌వర్డ్',
    'profile.confirmNewPassword': 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి',
    
    // Children
    'children.title': 'పిల్లలు',
    'children.addChild': 'పిల్లవాడిని జోడించండి',
    'children.childName': 'పిల్లవాడి పేరు',
    'children.dateOfBirth': 'జన్మ తేదీ',
    'children.gender': 'లింగం',
    'children.male': 'పురుషుడు',
    'children.female': 'స్త్రీ',
    'children.other': 'ఇతర',
    'children.viewDetails': 'వివరాలు చూడండి',
    'children.generateQR': 'QR కోడ్ జనరేట్ చేయండి',
    'children.downloadReport': 'నివేదిక డౌన్‌లోడ్ చేయండి',
    
    // Dashboard
    'dashboard.welcome': 'స్వాగతం',
    'dashboard.overview': 'అవలోకనం',
    'dashboard.recentActivity': 'ఇటీవలి కార్యకలాపం',
    'dashboard.upcomingVaccinations': 'రాబోయే వ్యాక్సినేషన్లు',
    'dashboard.statistics': 'గణాంకాలు',
    
    // Vaccinations
    'vaccinations.title': 'వ్యాక్సినేషన్లు',
    'vaccinations.schedule': 'వ్యాక్సినేషన్ షెడ్యూల్',
    'vaccinations.history': 'వ్యాక్సినేషన్ చరిత్ర',
    'vaccinations.upcoming': 'రాబోయే',
    'vaccinations.completed': 'పూర్తయింది',
    'vaccinations.overdue': 'ఆలస్యం',
    'vaccinations.scheduled': 'షెడ్యూల్ చేయబడింది',
    'vaccinations.missed': 'తప్పిపోయింది',
    
    // Languages
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.telugu': 'తెలుగు',
    'language.tamil': 'தமிழ்',
    'language.malayalam': 'മലയാളം',
  },
  
  ta: {
    // Navigation
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.children': 'குழந்தைகள்',
    'nav.vaccinations': 'தடுப்பூசிகள்',
    'nav.records': 'பதிவுகள்',
    'nav.education': 'கல்வி',
    'nav.profile': 'சுயவிவரம்',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.save': 'சேமிக்கவும்',
    'common.cancel': 'ரத்து செய்யவும்',
    'common.edit': 'திருத்தவும்',
    'common.delete': 'நீக்கவும்',
    'common.add': 'சேர்க்கவும்',
    'common.view': 'பார்க்கவும்',
    'common.download': 'பதிவிறக்கம்',
    'common.generate': 'உருவாக்கவும்',
    'common.search': 'தேடவும்',
    'common.filter': 'வடிகட்டி',
    'common.close': 'மூடவும்',
    'common.submit': 'சமர்ப்பிக்கவும்',
    'common.back': 'பின்செல்',
    'common.next': 'அடுத்து',
    'common.previous': 'முந்தைய',
    'common.yes': 'ஆம்',
    'common.no': 'இல்லை',
    
    // Auth
    'auth.login': 'உள்நுழைவு',
    'auth.signup': 'பதிவு செய்யவும்',
    'auth.logout': 'வெளியேறு',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'auth.forgotPassword': 'கடவுச்சொல் மறந்துவிட்டதா?',
    'auth.rememberMe': 'என்னை நினைவில் வைத்துக்கொள்',
    'auth.signInWith': 'இதன் மூலம் உள்நுழைக',
    'auth.dontHaveAccount': 'கணக்கு இல்லையா?',
    'auth.alreadyHaveAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    
    // Profile
    'profile.title': 'சுயவிவரம்',
    'profile.personalInfo': 'தனிப்பட்ட தகவல்',
    'profile.language': 'மொழி',
    'profile.displayName': 'காட்சி பெயர்',
    'profile.email': 'மின்னஞ்சல்',
    'profile.phoneNumber': 'தொலைபேசி எண்',
    'profile.role': 'பங்கு',
    'profile.memberSince': 'உறுப்பினரான தேதி',
    'profile.lastUpdated': 'கடைசியாக புதுப்பிக்கப்பட்டது',
    'profile.security': 'பாதுகாப்பு அமைப்புகள்',
    'profile.changePassword': 'கடவுச்சொல்லை மாற்றவும்',
    'profile.currentPassword': 'தற்போதைய கடவுச்சொல்',
    'profile.newPassword': 'புதிய கடவுச்சொல்',
    'profile.confirmNewPassword': 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    
    // Children
    'children.title': 'குழந்தைகள்',
    'children.addChild': 'குழந்தையை சேர்க்கவும்',
    'children.childName': 'குழந்தையின் பெயர்',
    'children.dateOfBirth': 'பிறந்த தேதி',
    'children.gender': 'பாலினம்',
    'children.male': 'ஆண்',
    'children.female': 'பெண்',
    'children.other': 'மற்றவை',
    'children.viewDetails': 'விவரங்களைப் பார்க்கவும்',
    'children.generateQR': 'QR குறியீட்டை உருவாக்கவும்',
    'children.downloadReport': 'அறிக்கையை பதிவிறக்கவும்',
    
    // Dashboard
    'dashboard.welcome': 'வரவேற்பு',
    'dashboard.overview': 'மேலோட்டம்',
    'dashboard.recentActivity': 'சமீபத்திய செயல்பாடு',
    'dashboard.upcomingVaccinations': 'வரவிருக்கும் தடுப்பூசிகள்',
    'dashboard.statistics': 'புள்ளிவிவரங்கள்',
    
    // Vaccinations
    'vaccinations.title': 'தடுப்பூசிகள்',
    'vaccinations.schedule': 'தடுப்பூசி அட்டவணை',
    'vaccinations.history': 'தடுப்பூசி வரலாறு',
    'vaccinations.upcoming': 'வரவிருக்கும்',
    'vaccinations.completed': 'முடிவடைந்தது',
    'vaccinations.overdue': 'தாமதம்',
    'vaccinations.scheduled': 'திட்டமிடப்பட்டது',
    'vaccinations.missed': 'தவறவிட்டது',
    
    // Languages
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.telugu': 'తెలుగు',
    'language.tamil': 'தமிழ்',
    'language.malayalam': 'മലയാളം',
  },
  
  ml: {
    // Navigation
    'nav.dashboard': 'ഡാഷ്ബോർഡ്',
    'nav.children': 'കുട്ടികൾ',
    'nav.vaccinations': 'വാക്സിനേഷനുകൾ',
    'nav.records': 'രേഖകൾ',
    'nav.education': 'വിദ്യാഭ്യാസം',
    'nav.profile': 'പ്രൊഫൈൽ',
    
    // Common
    'common.loading': 'ലോഡിംഗ്...',
    'common.save': 'സേവ് ചെയ്യുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.edit': 'എഡിറ്റ് ചെയ്യുക',
    'common.delete': 'ഇല്ലാതാക്കുക',
    'common.add': 'ചേർക്കുക',
    'common.view': 'കാണുക',
    'common.download': 'ഡൗൺലോഡ്',
    'common.generate': 'ജനറേറ്റ് ചെയ്യുക',
    'common.search': 'തിരയുക',
    'common.filter': 'ഫിൽട്ടർ',
    'common.close': 'അടയ്ക്കുക',
    'common.submit': 'സമർപ്പിക്കുക',
    'common.back': 'തിരികെ',
    'common.next': 'അടുത്തത്',
    'common.previous': 'മുമ്പത്തേത്',
    'common.yes': 'അതെ',
    'common.no': 'അല്ല',
    
    // Auth
    'auth.login': 'ലോഗിൻ',
    'auth.signup': 'സൈൻ അപ്പ്',
    'auth.logout': 'ലോഗൗട്ട്',
    'auth.email': 'ഇമെയിൽ',
    'auth.password': 'പാസ്വേഡ്',
    'auth.confirmPassword': 'പാസ്വേഡ് സ്ഥിരീകരിക്കുക',
    'auth.forgotPassword': 'പാസ്വേഡ് മറന്നോ?',
    'auth.rememberMe': 'എന്നെ ഓർത്തുവെക്കുക',
    'auth.signInWith': 'ഇതു വഴി സൈൻ ഇൻ ചെയ്യുക',
    'auth.dontHaveAccount': 'അക്കൗണ്ട് ഇല്ലേ?',
    'auth.alreadyHaveAccount': 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?',
    
    // Profile
    'profile.title': 'പ്രൊഫൈൽ',
    'profile.personalInfo': 'വ്യക്തിഗത വിവരങ്ങൾ',
    'profile.language': 'ഭാഷ',
    'profile.displayName': 'ഡിസ്പ്ലേ നെയിം',
    'profile.email': 'ഇമെയിൽ',
    'profile.phoneNumber': 'ഫോൺ നമ്പർ',
    'profile.role': 'റോൾ',
    'profile.memberSince': 'അംഗമായ തീയതി',
    'profile.lastUpdated': 'അവസാനം അപ്ഡേറ്റ് ചെയ്തത്',
    'profile.security': 'സെക്യൂരിറ്റി സെറ്റിംഗുകൾ',
    'profile.changePassword': 'പാസ്വേഡ് മാറ്റുക',
    'profile.currentPassword': 'നിലവിലെ പാസ്വേഡ്',
    'profile.newPassword': 'പുതിയ പാസ്വേഡ്',
    'profile.confirmNewPassword': 'പുതിയ പാസ്വേഡ് സ്ഥിരീകരിക്കുക',
    
    // Children
    'children.title': 'കുട്ടികൾ',
    'children.addChild': 'കുട്ടിയെ ചേർക്കുക',
    'children.childName': 'കുട്ടിയുടെ പേര്',
    'children.dateOfBirth': 'ജന്മ തീയതി',
    'children.gender': 'ലിംഗം',
    'children.male': 'പുരുഷൻ',
    'children.female': 'സ്ത്രീ',
    'children.other': 'മറ്റുള്ളവ',
    'children.viewDetails': 'വിശദാംശങ്ങൾ കാണുക',
    'children.generateQR': 'QR കോഡ് ജനറേറ്റ് ചെയ്യുക',
    'children.downloadReport': 'റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക',
    
    // Dashboard
    'dashboard.welcome': 'സ്വാഗതം',
    'dashboard.overview': 'അവലോകനം',
    'dashboard.recentActivity': 'സമീപകാല പ്രവർത്തനം',
    'dashboard.upcomingVaccinations': 'വരാനിരിക്കുന്ന വാക്സിനേഷനുകൾ',
    'dashboard.statistics': 'സ്ഥിതിവിവരക്കണക്കുകൾ',
    
    // Vaccinations
    'vaccinations.title': 'വാക്സിനേഷനുകൾ',
    'vaccinations.schedule': 'വാക്സിനേഷൻ ഷെഡ്യൂൾ',
    'vaccinations.history': 'വാക്സിനേഷൻ ചരിത്രം',
    'vaccinations.upcoming': 'വരാനിരിക്കുന്ന',
    'vaccinations.completed': 'പൂർത്തിയായി',
    'vaccinations.overdue': 'കാലതാമസം',
    'vaccinations.scheduled': 'ഷെഡ്യൂൾ ചെയ്തത്',
    'vaccinations.missed': 'നഷ്ടമായത്',
    
    // Languages
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.telugu': 'తెలుగు',
    'language.tamil': 'தமிழ்',
    'language.malayalam': 'മലയാളം',
  },
};