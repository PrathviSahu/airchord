import { PROFILES, type GestureProfile } from '../gesture/GestureProfiles';

interface ProfileSelectorProps {
  activeProfile: GestureProfile;
  onSelect: (profile: GestureProfile) => void;
}

export function ProfileSelector({ activeProfile, onSelect }: ProfileSelectorProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      display: 'flex',
      gap: 8,
      zIndex: 50,
    }}>
      {PROFILES.map(profile => (
        <button
          key={profile.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(profile);
          }}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: profile.id === activeProfile.id
              ? '2px solid #6366f1'
              : '1px solid rgba(255,255,255,0.2)',
            background: profile.id === activeProfile.id
              ? 'rgba(99, 102, 241, 0.3)'
              : 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            fontSize: 12,
            fontWeight: profile.id === activeProfile.id ? 700 : 400,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {profile.name}
        </button>
      ))}
    </div>
  );
}
