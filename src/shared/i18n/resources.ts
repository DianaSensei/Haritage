import { type Resource } from 'i18next';

export const resources: Resource = {
  en: {
    translation: {
      common: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        ok: 'OK',
        loading: 'Loading…',
        goBack: 'Go back',
        signInPrompt: 'Sign in to add a comment.',
        comingSoon: 'Feature coming soon.',
        ownedBy: '© {{year}} All rights reserved',
      },
      tabs: {
        home: 'Home',
        map: 'Map',
        account: 'Account',
      },
      comments: {
        title: 'Comments',
        countLabel: 'Comments ({{count}})',
        emptyTitle: 'No comments yet',
        emptySubtitle: 'Be the first to share your thoughts',
        replyingTo: 'Replying to {{name}}',
        placeholder: 'Add a comment…',
        replyPlaceholder: 'Reply to {{name}}…',
        commentingAsPrefix: 'Commenting as',
        you: 'You',
        anonymous: 'Anonymous',
      },
      commentItem: {
        reply: 'Reply',
        showReplies: 'Show {{count}} {{count, plural, one {reply} other {replies}}}',
        hideReplies: 'Hide {{count}} {{count, plural, one {reply} other {replies}}}',
        justNow: 'Just now',
        minuteAgo: '{{count}}m ago',
        hourAgo: '{{count}}h ago',
        dayAgo: '{{count}}d ago',
      },
      account: {
        guestUser: 'Guest User',
        statusActive: 'Account Active',
        sections: {
          settings: 'Settings',
          debug: 'Debug',
          account: 'Account',
        },
        menu: {
          securityPrivacy: 'Security & Privacy',
          appSettings: 'App Settings',
          helpSupport: 'Help & Support',
          debugTools: 'Debug Tools',
          logout: 'Log out',
        },
        info: {
          phone: 'Phone',
          email: 'Email',
          joined: 'Joined',
        },
        alerts: {
          permissionTitle: 'Permission required',
          permissionBody: 'Allow access to your photos so you can choose a new avatar.',
          selectionFailedTitle: 'Selection failed',
          selectionFailedBody: 'We could not read this image. Please try another one.',
          uploadSuccessTitle: 'Avatar updated',
          uploadSuccessBody: 'Your profile photo has been refreshed.',
          uploadFailedTitle: 'Upload failed',
          uploadFailedFallback: 'Failed to upload avatar.',
          logoutTitle: 'Log out',
          logoutBody: 'Are you sure you want to log out?',
          logoutSuccessTitle: 'Logged out',
          logoutSuccess: 'You have been logged out.',
          logoutFailedTitle: 'Logout failed',
          helpTitle: 'Help',
          helpBody: 'Help & support placeholder.',
          editProfileBody: 'Update user info feature coming soon.',
        },
        buttons: {
          editProfile: 'Edit Profile',
        },
        helper: {
          activePreference: 'Active preference: {{label}}',
          version: 'Haritage v1.0.0',
        },
        errors: {
          unknown: 'Unexpected error occurred.',
        },
      },
      debugTools: {
        title: 'Debug Tools',
        helper: {
          primary: 'Inspect AsyncStorage entries saved by Haritage.',
          secondary: 'Edit or remove items to verify integration flows during development.',
        },
        sections: {
          overview: {
            title: 'Storage Summary',
            description: 'Currently tracking {{count}} keys across the local store.',
          },
          manage: {
            title: 'Create New Entry',
            description: 'Add a key/value pair for quick testing or configuration overrides.',
          },
          entries: {
            title: 'Stored Entries',
            description: 'Review existing AsyncStorage records and adjust their payloads.',
          },
        },
        summary: {
          count: '{{count}} keys detected',
        },
        placeholders: {
          key: 'Storage key',
          value: 'Value',
        },
        buttons: {
          save: 'Save',
          delete: 'Delete',
          saveItem: 'Save item',
        },
        actions: {
          refresh: 'Refresh storage data',
        },
        alerts: {
          load: {
            title: 'Load failed',
            body: 'Could not load storage data.',
          },
          save: {
            title: 'Save failed',
            body: 'Could not save this entry.',
          },
          delete: {
            title: 'Delete failed',
            body: 'Could not delete this entry.',
          },
          confirmDelete: {
            title: 'Delete entry',
            body: 'Remove “{{key}}” from storage?',
          },
          missingKey: {
            title: 'Missing key',
            body: 'Provide a storage key.',
          },
          create: {
            title: 'Create failed',
            body: 'Could not create the entry.',
          },
        },
        empty: 'No storage entries detected.',
      },
      securityPrivacy: {
        title: 'Security & Privacy',
        biometricGeneric: 'Biometric',
        status: {
          checking: 'Checking device support…',
          notSupported: 'Biometric authentication is not available on this device.',
          noPin: 'Set up a PIN to enable biometric unlocking.',
          enabled: '{{type}} unlock is currently enabled.',
          disabled: '{{type}} unlock is currently disabled.',
        },
        cards: {
          status: {
            title: 'App Lock Status',
          },
          biometric: {
            title: '{{type}} Unlock',
            subtitleSupported: 'Use biometrics to unlock {{appName}}.',
            subtitleUnsupported: 'Unavailable on this device.',
            pinHelper: 'Create a PIN to enable biometric unlocking.',
            updating: 'Updating preference…',
          },
          about: {
            title: 'About Biometrics',
            description:
              '{{appName}} uses your device biometrics through the operating system. We never store raw biometric data and you can disable access at any time.',
          },
        },
        alerts: {
          pinRequired: {
            title: 'PIN required',
            body: 'Please create a PIN before enabling biometrics.',
          },
          notSupported: {
            title: 'Not supported',
            body: 'This device does not support biometric authentication.',
          },
          authFailed: {
            title: 'Authentication failed',
            body: 'Biometric authentication was canceled or failed.',
          },
          error: {
            title: 'Error',
            body: 'Could not update biometric preference. Try again later.',
          },
        debugTools: {
          title: 'Công cụ gỡ lỗi',
          helper: {
            primary: 'Kiểm tra các mục AsyncStorage mà Haritage đã lưu.',
            secondary: 'Chỉnh sửa hoặc xoá mục để kiểm thử trong quá trình phát triển.',
          },
          sections: {
            overview: {
              title: 'Tổng quan bộ nhớ',
              description: 'Hiện đang theo dõi {{count}} khóa trong bộ nhớ cục bộ.',
            },
            manage: {
              title: 'Tạo mục mới',
              description: 'Thêm cặp khóa/giá trị để thử nghiệm nhanh hoặc ghi đè cấu hình.',
            },
            entries: {
              title: 'Các mục đã lưu',
              description: 'Xem và điều chỉnh các bản ghi AsyncStorage hiện có.',
            },
          },
          summary: {
            count: 'Phát hiện {{count}} khóa',
          },
          placeholders: {
            key: 'Khóa lưu trữ',
            value: 'Giá trị',
          },
          buttons: {
            save: 'Lưu',
            delete: 'Xóa',
            saveItem: 'Lưu mục',
          },
          actions: {
            refresh: 'Tải lại dữ liệu lưu trữ',
          },
          alerts: {
            load: {
              title: 'Tải thất bại',
              body: 'Không thể tải dữ liệu lưu trữ.',
            },
            save: {
              title: 'Lưu thất bại',
              body: 'Không thể lưu mục này.',
            },
            delete: {
              title: 'Xóa thất bại',
              body: 'Không thể xóa mục này.',
            },
            confirmDelete: {
              title: 'Xóa mục',
              body: 'Bạn có chắc chắn muốn xóa “{{key}}” khỏi bộ nhớ?',
            },
            missingKey: {
              title: 'Thiếu khóa',
              body: 'Vui lòng nhập khóa lưu trữ.',
            },
            create: {
              title: 'Tạo thất bại',
              body: 'Không thể tạo mục này.',
            },
          },
          empty: 'Không có mục lưu trữ nào.',
        },
        },
      },
      support: {
        title: 'Help & Support',
        subtitle: 'Contact us or browse quick answers from the team.',
        contact: {
          title: 'Contact options',
          description: 'Reach out whenever you need a hand.',
          actions: {
            call: {
              title: 'Call support',
              description: 'Tap to call {{phone}}.',
            },
            email: {
              title: 'Email support',
              description: 'Send us a message at {{email}}.',
            },
          },
        },
        faq: {
          title: 'Frequently Asked Questions',
          description: 'Latest guidance curated by the support team.',
          empty: 'No FAQs available yet.',
          error: 'We could not refresh FAQs right now. Showing any saved answers below.',
          cached: 'Loaded from saved answers.',
          lastUpdated: 'Last updated {{time}}',
          items: {
            gettingStarted: {
              question: 'How do I get started with Haritage?',
              answer: 'Sign in with your account, explore the Home feed for inspiration, and create new posts from the compose button when you are ready to share.',
            },
            languageSwitch: {
              question: 'How do I change the app language?',
              answer: 'Open App Settings from your account tab, scroll to the Language section, and pick the language you want. The interface updates right away.',
            },
            appLock: {
              question: 'How can I secure the app with a PIN or biometrics?',
              answer: 'Set up a PIN from Security & Privacy. Once a PIN is set, you can enable biometric unlock and manage authentication preferences there.',
            },
            contactTeam: {
              question: 'What should I do if I still need help?',
              answer: 'Use the call or email actions above to reach the Haritage support team. We aim to respond within one business day.',
            },
          },
        },
        actions: {
          retry: 'Try again',
        },
        alerts: {
          phoneFailed: {
            title: 'Cannot start call',
            body: 'Please call {{phone}} manually.',
          },
          emailFailed: {
            title: 'Cannot open mail app',
            body: 'Send a message to {{email}} using your preferred email client.',
          },
          faqFailed: {
            title: 'Refresh failed',
            body: 'Unable to update FAQs. Showing cached answers if available.',
          },
        },
      },
      home: {
        header: {
          title: 'Discover',
          subtitle: 'Stories curated for your interests',
          composeLabel: 'New post',
          composeAccessibility: 'Create post',
        },
        stats: {
          posts: 'Posts',
          appreciations: 'Appreciations',
          conversations: 'Conversations',
        },
        filters: {
          forYou: 'For you',
          nearby: 'Nearby',
          popular: 'Popular',
          following: 'Following',
        },
        alerts: {
          shareTitle: 'Share',
          shareBody: 'Opening share dialog...',
        },
        notifications: {
          welcomeTitle: 'Welcome to Haritage!',
          welcomeMessage: 'Explore amazing posts from the community.',
        },
        emptyState: {
          loadingTitle: 'Loading posts...',
          loadingSubtitle: "We're fetching the latest content for you.",
          emptyTitle: 'No posts yet',
          emptySubtitle: 'Be the first to share something with the community!',
          actionButton: 'Create First Post',
          hint: 'Posts from the community will appear here. Follow creators to see their latest updates.',
        },
      },
      appSettings: {
        title: 'App Settings',
        appearanceTitle: 'Appearance',
        appearanceDescription: 'Choose how Haritage should look. You can follow the device or force a specific theme.',
        languageTitle: 'Language',
        languageDescription: 'Switch between supported languages instantly.',
        helperActivePreference: 'Active preference: {{label}}',
        themes: {
          systemTitle: 'System Default',
          systemDescription: 'Match your device appearance automatically.',
          lightTitle: 'Light',
          lightDescription: 'Bright surfaces with crisp contrast.',
          darkTitle: 'Dark',
          darkDescription: 'Dimmed surfaces with reduced glare.',
        },
        languages: {
          en: 'English',
          vi: 'Vietnamese',
        },
      },
      commentsScreen: {
        signInPrompt: 'Sign in to add a comment.',
      },
      createPost: {
        titlePlaceholder: 'Title',
        bodyPlaceholder: 'Body text (optional)',
        tagPlaceholder: 'Add tags… (space ends tag)',
        urlPlaceholder: 'Add URL (optional)',
        urlInvalid: 'Invalid URL format',
        pollQuestionPlaceholder: 'Poll question',
        pollOptionPlaceholder: 'Option {{index}}',
        pollAddOption: '+ Add option',
        pollCloseHoursPlaceholder: '24',
        toolbar: {
          add: 'Add',
          media: 'Media',
          poll: 'Poll',
        },
        validation: {
          titleRequired: 'Please add a title.',
          contentRequired: 'Please add at least one content type.',
        },
        alerts: {
          validationTitle: 'Validation',
          permissionTitle: 'Permissions required',
          permissionBody: 'Please allow photo library access.',
          successTitle: 'Success',
          successBody: 'Post saved to your feed.',
          errorTitle: 'Error',
          errorBody: 'Failed to save your post locally.',
          mediaError: 'Unable to pick media.',
        },
        unauthenticatedTitle: 'You must be logged in to create a post.',
        submit: 'Post',
        submitting: '…',
        helper: {
          defaultContent: 'Shared an update',
          authorFallback: 'You',
        },
      },
    },
  },
  vi: {
    translation: {
      common: {
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        close: 'Đóng',
        ok: 'OK',
        loading: 'Đang tải…',
        goBack: 'Quay lại',
        signInPrompt: 'Đăng nhập để bình luận.',
        comingSoon: 'Tính năng sẽ sớm ra mắt.',
        ownedBy: '© {{year}} Đã đăng ký bản quyền',
      },
      tabs: {
        home: 'Trang chủ',
        map: 'Bản đồ',
        account: 'Tài khoản',
      },
      comments: {
        title: 'Bình luận',
        countLabel: 'Bình luận ({{count}})',
        emptyTitle: 'Chưa có bình luận',
        emptySubtitle: 'Hãy là người đầu tiên chia sẻ suy nghĩ của bạn',
        replyingTo: 'Đang trả lời {{name}}',
        placeholder: 'Viết bình luận…',
        replyPlaceholder: 'Trả lời {{name}}…',
        commentingAsPrefix: 'Bình luận với tên',
        you: 'Bạn',
        anonymous: 'Ẩn danh',
      },
      commentItem: {
        reply: 'Trả lời',
        showReplies: 'Hiển thị {{count}} {{count, plural, one {phản hồi} other {phản hồi}}}',
        hideReplies: 'Ẩn {{count}} {{count, plural, one {phản hồi} other {phản hồi}}}',
        justNow: 'Vừa xong',
        minuteAgo: '{{count}}p trước',
        hourAgo: '{{count}}g trước',
        dayAgo: '{{count}}n trước',
      },
      account: {
        guestUser: 'Khách',
        statusActive: 'Tài khoản đang hoạt động',
        sections: {
          settings: 'Cài đặt',
          debug: 'Gỡ lỗi',
          account: 'Tài khoản',
        },
        menu: {
          securityPrivacy: 'Bảo mật & Quyền riêng tư',
          appSettings: 'Cài đặt ứng dụng',
          helpSupport: 'Trợ giúp & Hỗ trợ',
          debugTools: 'Công cụ gỡ lỗi',
          logout: 'Đăng xuất',
        },
        info: {
          phone: 'Điện thoại',
          email: 'Email',
          joined: 'Tham gia',
        },
        alerts: {
          permissionTitle: 'Cần quyền truy cập',
          permissionBody: 'Cho phép truy cập ảnh để chọn ảnh đại diện mới.',
          selectionFailedTitle: 'Chọn ảnh thất bại',
          selectionFailedBody: 'Không thể đọc ảnh này. Vui lòng thử ảnh khác.',
          uploadSuccessTitle: 'Đã cập nhật ảnh đại diện',
          uploadSuccessBody: 'Ảnh hồ sơ của bạn đã được làm mới.',
          uploadFailedTitle: 'Tải lên thất bại',
          uploadFailedFallback: 'Không thể tải ảnh đại diện.',
          logoutTitle: 'Đăng xuất',
          logoutBody: 'Bạn có chắc muốn đăng xuất?',
          logoutSuccessTitle: 'Đã đăng xuất',
          logoutSuccess: 'Bạn đã đăng xuất.',
          logoutFailedTitle: 'Đăng xuất thất bại',
          helpTitle: 'Trợ giúp',
          helpBody: 'Nội dung trợ giúp tạm thời.',
          editProfileBody: 'Tính năng cập nhật thông tin người dùng sẽ ra mắt sau.',
        },
        buttons: {
          editProfile: 'Chỉnh sửa hồ sơ',
        },
        helper: {
          activePreference: 'Tùy chọn hiện tại: {{label}}',
          version: 'Haritage v1.0.0',
        },
        errors: {
          unknown: 'Đã xảy ra lỗi không xác định.',
        },
      },
      securityPrivacy: {
        title: 'Bảo mật & Quyền riêng tư',
        biometricGeneric: 'Sinh trắc học',
        status: {
          checking: 'Đang kiểm tra hỗ trợ thiết bị…',
          notSupported: 'Thiết bị này không hỗ trợ xác thực sinh trắc học.',
          noPin: 'Thiết lập mã PIN để bật mở khóa sinh trắc học.',
          enabled: 'Mở khóa {{type}} đang được bật.',
          disabled: 'Mở khóa {{type}} đang bị tắt.',
        },
        cards: {
          status: {
            title: 'Trạng thái khóa ứng dụng',
          },
          biometric: {
            title: 'Mở khóa {{type}}',
            subtitleSupported: 'Sử dụng sinh trắc học để mở khóa {{appName}}.',
            subtitleUnsupported: 'Không khả dụng trên thiết bị này.',
            pinHelper: 'Tạo mã PIN để bật mở khóa sinh trắc học.',
            updating: 'Đang cập nhật thiết lập…',
          },
          about: {
            title: 'Giới thiệu về sinh trắc học',
            description:
              '{{appName}} sử dụng dữ liệu sinh trắc học của thiết bị thông qua hệ điều hành. Chúng tôi không lưu trữ dữ liệu sinh trắc học thô và bạn có thể tắt quyền truy cập bất cứ lúc nào.',
          },
        },
        alerts: {
          pinRequired: {
            title: 'Cần mã PIN',
            body: 'Vui lòng tạo mã PIN trước khi bật sinh trắc học.',
          },
          notSupported: {
            title: 'Không hỗ trợ',
            body: 'Thiết bị này không hỗ trợ xác thực sinh trắc học.',
          },
          authFailed: {
            title: 'Xác thực thất bại',
            body: 'Xác thực sinh trắc học đã bị hủy hoặc thất bại.',
          },
          error: {
            title: 'Lỗi',
            body: 'Không thể cập nhật tùy chọn sinh trắc học. Vui lòng thử lại sau.',
          },
        },
      },
      support: {
        title: 'Trợ giúp & Hỗ trợ',
        subtitle: 'Liên hệ với chúng tôi hoặc xem nhanh các câu trả lời phổ biến.',
        contact: {
          title: 'Kênh liên hệ',
          description: 'Hãy nhắn khi bạn cần hỗ trợ.',
          actions: {
            call: {
              title: 'Gọi hỗ trợ',
              description: 'Nhấn để gọi {{phone}}.',
            },
            email: {
              title: 'Email hỗ trợ',
              description: 'Gửi tin nhắn tới {{email}}.',
            },
          },
        },
        faq: {
          title: 'Câu hỏi thường gặp',
          description: 'Các hướng dẫn mới nhất từ đội ngũ hỗ trợ.',
          empty: 'Chưa có câu hỏi nào.',
          error: 'Không thể cập nhật danh sách FAQ. Đang hiển thị dữ liệu đã lưu (nếu có).',
          cached: 'Đang hiển thị nội dung đã lưu.',
          lastUpdated: 'Cập nhật lần cuối {{time}}',
          items: {
            gettingStarted: {
              question: 'Làm sao để bắt đầu với Haritage?',
              answer: 'Đăng nhập tài khoản, khám phá nguồn tin Trang chủ để lấy cảm hứng và tạo bài viết mới bằng nút đăng bài khi bạn sẵn sàng chia sẻ.',
            },
            languageSwitch: {
              question: 'Làm sao để đổi ngôn ngữ ứng dụng?',
              answer: 'Mở Cài đặt ứng dụng trong tab Tài khoản, cuộn đến phần Ngôn ngữ và chọn ngôn ngữ mong muốn. Giao diện sẽ cập nhật ngay lập tức.',
            },
            appLock: {
              question: 'Làm sao để bảo vệ ứng dụng bằng mã PIN hoặc sinh trắc học?',
              answer: 'Thiết lập mã PIN trong mục Bảo mật & Quyền riêng tư. Sau khi có mã PIN, bạn có thể bật mở khóa sinh trắc học và quản lý tùy chọn xác thực tại đó.',
            },
            contactTeam: {
              question: 'Nếu vẫn cần hỗ trợ thì tôi nên làm gì?',
              answer: 'Sử dụng các thao tác gọi hoặc gửi email ở trên để liên hệ đội hỗ trợ Haritage. Chúng tôi sẽ phản hồi trong vòng một ngày làm việc.',
            },
          },
        },
        actions: {
          retry: 'Thử lại',
        },
        alerts: {
          phoneFailed: {
            title: 'Không thể bắt đầu cuộc gọi',
            body: 'Vui lòng gọi {{phone}} thủ công.',
          },
          emailFailed: {
            title: 'Không mở được ứng dụng email',
            body: 'Gửi thư tới {{email}} bằng ứng dụng email bạn chọn.',
          },
          faqFailed: {
            title: 'Làm mới thất bại',
            body: 'Không thể cập nhật FAQ. Đang hiển thị dữ liệu đã lưu nếu có.',
          },
        },
      },
      home: {
        header: {
          title: 'Khám phá',
          subtitle: 'Những câu chuyện được tuyển chọn theo sở thích của bạn',
          composeLabel: 'Bài viết mới',
          composeAccessibility: 'Tạo bài viết',
        },
        stats: {
          posts: 'Bài viết',
          appreciations: 'Lượt yêu thích',
          conversations: 'Cuộc trò chuyện',
        },
        filters: {
          forYou: 'Dành cho bạn',
          nearby: 'Gần bạn',
          popular: 'Phổ biến',
          following: 'Đang theo dõi',
        },
        alerts: {
          shareTitle: 'Chia sẻ',
          shareBody: 'Đang mở hộp thoại chia sẻ...',
        },
        notifications: {
          welcomeTitle: 'Chào mừng đến với Haritage!',
          welcomeMessage: 'Khám phá những bài viết tuyệt vời từ cộng đồng.',
        },
        emptyState: {
          loadingTitle: 'Đang tải bài viết...',
          loadingSubtitle: 'Chúng tôi đang lấy nội dung mới nhất cho bạn.',
          emptyTitle: 'Chưa có bài viết',
          emptySubtitle: 'Hãy là người đầu tiên chia sẻ với cộng đồng!',
          actionButton: 'Tạo bài viết đầu tiên',
          hint: 'Bài viết từ cộng đồng sẽ xuất hiện tại đây. Theo dõi các tác giả để xem cập nhật mới nhất.',
        },
      },
      appSettings: {
        title: 'Cài đặt ứng dụng',
        appearanceTitle: 'Giao diện',
        appearanceDescription: 'Chọn cách Haritage hiển thị. Có thể theo thiết bị hoặc cố định một chủ đề.',
        languageTitle: 'Ngôn ngữ',
        languageDescription: 'Chuyển đổi giữa các ngôn ngữ được hỗ trợ.',
        helperActivePreference: 'Tùy chọn hiện tại: {{label}}',
        themes: {
          systemTitle: 'Theo hệ thống',
          systemDescription: 'Tự động khớp với giao diện thiết bị của bạn.',
          lightTitle: 'Sáng',
          lightDescription: 'Nền sáng với độ tương phản rõ nét.',
          darkTitle: 'Tối',
          darkDescription: 'Nền tối giúp giảm chói.',
        },
        languages: {
          en: 'Tiếng Anh',
          vi: 'Tiếng Việt',
        },
      },
      commentsScreen: {
        signInPrompt: 'Đăng nhập để bình luận.',
      },
      createPost: {
        titlePlaceholder: 'Tiêu đề',
        bodyPlaceholder: 'Nội dung (tùy chọn)',
        tagPlaceholder: 'Thêm thẻ… (dấu cách để kết thúc)',
        urlPlaceholder: 'Thêm URL (tùy chọn)',
        urlInvalid: 'URL không hợp lệ',
        pollQuestionPlaceholder: 'Câu hỏi khảo sát',
        pollOptionPlaceholder: 'Lựa chọn {{index}}',
        pollAddOption: '+ Thêm lựa chọn',
        pollCloseHoursPlaceholder: '24',
        toolbar: {
          add: 'Thêm',
          media: 'Phương tiện',
          poll: 'Bình chọn',
        },
        validation: {
          titleRequired: 'Vui lòng thêm tiêu đề.',
          contentRequired: 'Vui lòng thêm ít nhất một nội dung.',
        },
        alerts: {
          validationTitle: 'Kiểm tra',
          permissionTitle: 'Cần cấp quyền',
          permissionBody: 'Vui lòng cho phép truy cập thư viện ảnh.',
          successTitle: 'Thành công',
          successBody: 'Bài viết đã được lưu.',
          errorTitle: 'Lỗi',
          errorBody: 'Không thể lưu bài viết.',
          mediaError: 'Không thể chọn phương tiện.',
        },
        unauthenticatedTitle: 'Bạn phải đăng nhập để tạo bài viết.',
        submit: 'Đăng',
        submitting: '…',
        helper: {
          defaultContent: 'Đã chia sẻ một cập nhật',
          authorFallback: 'Bạn',
        },
      },
    },
  },
};

export type AppLanguage = 'en' | 'vi';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const SUPPORTED_LANGUAGES: Record<AppLanguage, { label: string }> = {
  en: { label: 'English' },
  vi: { label: 'Tiếng Việt' },
};

export const isSupportedLanguage = (lang?: string): lang is AppLanguage =>
  !!lang && Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, lang);
