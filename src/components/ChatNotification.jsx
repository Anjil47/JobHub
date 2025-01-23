import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

export default function ChatNotification({ request, onView, t }) {
  return (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          {request.from.photoURL ? (
            <img
              className="h-10 w-10 rounded-full"
              src={request.from.photoURL}
              alt=""
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-lg font-medium">
                {(request.from.displayName || 'A')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {request.from.displayName}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Sent you a chat request
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => {
            onView();
            toast.dismiss(t.id);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          View
        </button>
      </div>
    </div>
  );
}

ChatNotification.propTypes = {
  request: PropTypes.shape({
    from: PropTypes.shape({
      photoURL: PropTypes.string,
      displayName: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  t: PropTypes.shape({
    visible: PropTypes.bool,
    id: PropTypes.string,
  }).isRequired,
}; 