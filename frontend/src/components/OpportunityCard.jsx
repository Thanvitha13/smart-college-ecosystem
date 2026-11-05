import { ArrowUpRight, Bookmark, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryClass = (category = '') => category.toLowerCase().replaceAll(' ', '-');
const daysRemaining = (deadline) => Math.ceil((new Date(deadline) - Date.now()) / 86400000);

export default function OpportunityCard({ opportunity, saved = false, onToggleSave, showMatch = false }) {
  if (!opportunity) return null;
  const days = daysRemaining(opportunity.deadline);
  return (
    <article className="opportunity-card">
      <div className="card-topline">
        <span className={`category-tag category-${categoryClass(opportunity.category)}`}>{opportunity.category}</span>
        {showMatch && <span className="match-score">{opportunity.matchPercentage || 0}% match</span>}
        {onToggleSave && <button className={`icon-button bookmark-button ${saved ? 'is-saved' : ''}`} onClick={() => onToggleSave(opportunity._id, saved)} aria-label={saved ? 'Remove bookmark' : 'Save opportunity'} title={saved ? 'Remove bookmark' : 'Save opportunity'}>
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>}
      </div>
      <Link to={`/opportunities/${opportunity._id}`} className="card-title-link">
        {opportunity.image && <img className="opportunity-logo" src={opportunity.image} alt={`${opportunity.organization} logo`} loading="lazy" referrerPolicy="no-referrer" />}
        <h3>{opportunity.title}</h3>
        <ArrowUpRight size={17} />
      </Link>
      <p className="organization-name">{opportunity.organization}</p>
      <p className="card-description">{opportunity.description}</p>
      <div className="card-skills">{(opportunity.requiredSkills || []).slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}{opportunity.requiredSkills?.length > 3 && <span>+{opportunity.requiredSkills.length - 3}</span>}</div>
      <div className="card-footer">
        <span><MapPin size={14} />{opportunity.location || 'Remote'}</span>
        <span className={days <= 5 ? 'deadline-urgent' : ''}><CalendarDays size={14} />{days < 0 ? 'Closed' : days === 0 ? 'Due today' : `${days} days left`}</span>
      </div>
    </article>
  );
}
