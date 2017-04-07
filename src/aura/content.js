import Content from '../core/content/Content';
import FetchHeaders from '../core/content/processors/FetchHeaders';

new Content(['aura', 'default'], [new FetchHeaders()]);

