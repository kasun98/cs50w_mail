document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', () => sen());
  
  // By default, load the inbox
  load_mailbox('inbox');
  //setInterval(fetchEmails, 5000);
  
});

// view email content
function view_mail(eid, mailbox) {
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#container').style.display = 'none';
  document.querySelector('#open_email').style.display = 'block';

  fetch(`/emails/${eid}`)
  .then(response => response.json())
  .then(email => {
      // Print emails
      console.log(email);

      const sender = document.querySelector('#from').innerHTML = email.sender;
      document.querySelector('#to').innerHTML = email.recipients;
      const subject = document.querySelector('#subject').innerHTML = email.subject;
      const timestamp = document.querySelector('#timestamp').innerHTML = email.timestamp;
      const body = document.querySelector('.open_mail_p').innerHTML = email.body;
      
      if (mailbox==='inbox' && email.read===false) {
        fetch(`/emails/${eid}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      };

      if (mailbox === 'inbox') {
        document.querySelector('#arch').hidden = false;
        document.querySelector('#arch').innerHTML= 'Archive';
      } else if (mailbox === 'archive') {
        document.querySelector('#arch').hidden = false;
        document.querySelector('#arch').innerHTML= 'Unarchive';
      };
      document.querySelector('#arch').onclick = function() {
        archive_un(eid, mailbox)
      };
      document.querySelector('#reply').onclick = function() {
        compose_email(sender, subject, timestamp, body)
      };
  }); 
}

// archive or unarchive emails
async function archive_un (email_id,mailbox) {
  if (mailbox === 'inbox') {
    try {
      const response = await fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      load_mailbox('inbox');

    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }

  } else if (mailbox === 'archive') {
    try {
      const response = await fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      load_mailbox('inbox');
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };
}



// send emails
function sen() {
  const to = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  if (to && subject && body) {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: to,
          subject: subject,
          body: body
      })
    })
    .then(response => {
      if (response.status === 201) {
        showModal('Email sent successfully!');
        return load_mailbox('sent');
      }
      else {
        showModal(`User with email ${to} does not exist`);
      }
      return response.json(); })
    .then(result => {
        // Print result
        console.log(result);
    }); 
  }
  else {
    showModal('Fill all the fields before send!');
  } 
}

// popup messages
function showModal(message) {
  document.getElementById('modalMessage').innerText = message;
  $('#messageModal').modal('show');
}

// compose email view
function compose_email(sender = false, subject = false, timestamp = false, body = false) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#container').style.display = 'none';
  document.querySelector('#open_email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // reply to inbox
  if (sender && subject && timestamp && body) {
    document.querySelector('#compose-recipients').value = sender;
    if (subject.startsWith("Re: ")) {
      subject = subject;
    } else {
      subject = "Re: " + subject;
    };
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: \n "${body}"`;
  }
}

// load mailbox - inbox, sent, archieved
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#container').style.display = 'none';
  document.querySelector('#open_email').style.display = 'none';
  document.querySelector('#reply').hidden = false;

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 style = "font-family: cursive;">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#arch').hidden = true;
  if (mailbox==='sent') {
    document.querySelector('#reply').hidden = true;
  };

  // load emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      document.querySelector('#container').innerHTML = '';
      document.querySelector('#container').style.display = 'block';

      if (emails.length === 0) {
        const element = document.createElement('div');
        element.className = 'element-id';
        element.innerHTML= 'Empty folder. Welcome to Mail! Start chat with friends';
        document.querySelector('#container').append(element);
      };

      emails.forEach(email => {
        const element = document.createElement('div');
        element.className = 'element-id';
        element.id = `element${email.id}`;
        
        if (mailbox === 'inbox' && email.read === false) {
          element.style.backgroundColor = 'white' ;
          element.style.fontWeight = 'Bold';
        };

        const senderElement = document.createElement('a');
        senderElement.className = 'sender-id';
        senderElement.id = `sender${email.id}`;
        const subjectElement = document.createElement('a');
        subjectElement.className = 'subject-id';
        subjectElement.id = `subject${email.id}`;
        const timestampElement = document.createElement('a');
        timestampElement.className = 'timestamp-id';
        timestampElement.id = `timestamp${email.id}`;

        senderElement.textContent = email.sender;
        subjectElement.textContent = email.subject;
        timestampElement.textContent = email.timestamp;

        element.appendChild(senderElement);
        element.appendChild(subjectElement);
        element.appendChild(timestampElement);

        document.querySelector('#container').append(element);

        document.querySelector(`#element${email.id}`).addEventListener('click', () => view_mail(email.id,mailbox));
 
      });
  });   
}



