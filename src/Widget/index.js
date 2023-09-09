import { WIDGET_ENDPOINT, WIDGET_RECEIVE_EVENTS } from '../constants';
import { addEvent } from '../utils/helpers';

const iframwStyles = {
  display: 'none',
  position: 'fixed',
  borderRadius: '0',
  border: 'none',
  zIndex: '2147483647',
};

function applyStyles(elemment, styles) {
  for (const [cssProperty, value] of Object.entries(styles)) {
    elemment.style[cssProperty] = value;
  }
}

class WidgetController {
  constructor() {
    this.setUserDefinedOnClick = this.setUserDefinedOnClick.bind(this);
  }

  init(appKey) {
    const createIframe = () => {
      const iframe = document.createElement('iframe');
      iframe.src = WIDGET_ENDPOINT + `/?appKey=${appKey}`;
      iframe.title = 'Spock Widget';
      iframe.id = 'spock-widget';
      iframe.dataset.spockIframeLabel = new URL(WIDGET_ENDPOINT).host;
      applyStyles(iframe, iframwStyles);
      document.body.appendChild(iframe);
      return iframe;
    };

    this.iframe = createIframe();

    addEvent(window, 'message', this.eventHandler.bind(this));
  }

  eventHandler(event) {
    const { origin, data } = event;
    if (origin === WIDGET_ENDPOINT) {
      switch (data?.message) {
        case WIDGET_RECEIVE_EVENTS.SHOW_POPUP:
          this.show(data?.body);
          break;
        case WIDGET_RECEIVE_EVENTS.HIDE_POPUP:
          this.hide();
          break;
        case WIDGET_RECEIVE_EVENTS.BUTTON_CLICK:
          this.hide();
          if (data?.body?.redirectUrl) {
            window.location.href = data?.body?.redirectUrl;
          } else if (this.userDefinedClickMethod) {
            this.userDefinedClickMethod(data?.body);
          }
          break;
        default:
          break;
      }
    }
  }

  async documentLoaded(counter) {
    if (document.readyState != 'complete') {
      await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
      //counter for protecting from infinite recursion
      counter < 5 && (await this.documentLoaded(counter + 1));
    }
  }

  async postMessage(message, body) {
    if (this.iframe && this.iframe.contentWindow) {
      //wait util document loading is complete
      await this.documentLoaded(0);
      this.iframe.contentWindow.postMessage({ message, body }, WIDGET_ENDPOINT);
    }
  }

  show(styles) {
    applyStyles(this.iframe, styles);
  }

  hide() {
    this.iframe.style.display = 'none';
  }

  setUserDefinedOnClick(method) {
    this.userDefinedClickMethod = method;
  }
}

export default new WidgetController();
